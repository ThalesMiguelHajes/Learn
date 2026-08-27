import { timingSafeEqual } from 'node:crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function isValidSecret(received, expected) {
  if (!received || !expected) return false
  const receivedBuf = Buffer.from(received)
  const expectedBuf = Buffer.from(expected)
  if (receivedBuf.length !== expectedBuf.length) return false
  return timingSafeEqual(receivedBuf, expectedBuf)
}

// POST /api/webhook/abacatepay
// Recebe notificações da AbacatePay quando um pagamento é confirmado
export async function POST(request) {
  try {
    // 1. Validar o webhook secret (segurança)
    // A AbacatePay envia o secret como query param: ?webhookSecret=xxx
    const { searchParams } = new URL(request.url)
    const receivedSecret = searchParams.get('webhookSecret')
    const expectedSecret = process.env.ABACATEPAY_WEBHOOK_SECRET

    if (!expectedSecret) {
      console.error('[AbacatePay Webhook] ABACATEPAY_WEBHOOK_SECRET não configurado — recusando webhook.')
      return NextResponse.json({ error: 'Webhook não configurado' }, { status: 401 })
    }

    if (!isValidSecret(receivedSecret, expectedSecret)) {
      console.warn('[AbacatePay Webhook] Secret inválido recebido.')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Ler o payload do evento
    const payload = await request.json()
    const { event, data, devMode } = payload

    // Log para debug (remova em produção se desejar)
    console.log(`[AbacatePay Webhook] Evento: ${event}`, { devMode, billingId: data?.id })

    // 3. Só processar o evento de pagamento confirmado
    const eventName = (event || '').toUpperCase()
    if (eventName !== 'BILLING.PAID' && eventName !== 'CHECKOUT.COMPLETED') {
      // Responde 200 para outros eventos (evita retry desnecessário)
      return NextResponse.json({ received: true, processed: false })
    }

    // 4. Extrair metadata com os IDs do nosso sistema
    // Na API v1 da AbacatePay, os dados ficam dentro de data.billing
    const billingData = data?.billing || data || {}
    const { userId, ebookId } = billingData?.metadata || {}

    if (!userId || !ebookId) {
      console.error('[AbacatePay Webhook] metadata incompleto:', billingData?.metadata)
      return NextResponse.json({ error: 'Metadata inválido' }, { status: 400 })
    }

    const billingId = billingData?.id
    const totalAmount = (billingData?.amount || 0) / 100 // AbacatePay retorna em centavos

    // 5. Usar a service role para operar sem restrições de RLS
    const supabase = createServiceClient()

    // 6. Cruzar com o checkout pendente registrado no /api/checkout — o payload do
    // webhook por si só não é uma prova confiável de quem comprou o quê.
    const { data: checkout } = await supabase
      .from('pending_checkouts')
      .select('id, user_id, ebook_id, status')
      .eq('billing_id', billingId)
      .single()

    if (!checkout) {
      console.error('[AbacatePay Webhook] Nenhum pending_checkout encontrado para billing_id:', billingId)
      return NextResponse.json({ error: 'Checkout não encontrado' }, { status: 404 })
    }

    if (checkout.user_id !== userId || checkout.ebook_id !== ebookId) {
      console.error('[AbacatePay Webhook] Metadata não confere com o pending_checkout registrado:', { billingId, checkout, userId, ebookId })
      return NextResponse.json({ error: 'Metadata inconsistente' }, { status: 400 })
    }

    if (checkout.status === 'paid') {
      console.log('[AbacatePay Webhook] Evento duplicado ignorado:', billingId)
      return NextResponse.json({ received: true, processed: false, reason: 'duplicate' })
    }

    // 7. Criar a venda no Supabase (libera o acesso ao e-book)
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([{
        user_id: userId,
        total_amount: totalAmount,
        payment_source: 'abacatepay',
        billing_id: billingId,
        payment_status: 'paid',
      }])
      .select()
      .single()

    if (saleError) {
      console.error('[AbacatePay Webhook] Erro ao criar venda:', saleError)
      return NextResponse.json({ error: 'Erro ao registrar venda' }, { status: 500 })
    }

    // 8. Criar o item da venda
    await supabase
      .from('sale_items')
      .insert([{ sale_id: sale.id, ebook_id: ebookId }])

    // 9. Liberar o e-book para o usuário (upsert — seguro se rodar duas vezes)
    const { error: assignError } = await supabase
      .from('user_ebooks')
      .upsert(
        [{ user_id: userId, ebook_id: ebookId, assigned_by: null }],
        { onConflict: 'user_id,ebook_id' }
      )

    if (assignError) {
      console.error('[AbacatePay Webhook] Erro ao liberar e-book:', assignError)
      // Venda já foi criada, não retorna erro — o admin pode liberar manualmente
    }

    // 10. Atualizar o pending_checkout para "paid"
    await supabase
      .from('pending_checkouts')
      .update({ status: 'paid' })
      .eq('billing_id', billingId)

    console.log(`[AbacatePay Webhook] ✅ E-book ${ebookId} liberado para usuário ${userId}`)

    return NextResponse.json({ received: true, processed: true })
  } catch (err) {
    console.error('[AbacatePay Webhook] Erro inesperado:', err)
    // Não retornamos 500 aqui para evitar que a AbacatePay fique retentando indefinidamente
    // em caso de bug. Retorne 500 apenas se for um erro transiente (ex: DB offline).
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
