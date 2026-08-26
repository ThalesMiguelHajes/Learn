import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/webhook/abacatepay
// Recebe notificações da AbacatePay quando um pagamento é confirmado
export async function POST(request) {
  try {
    // 1. Validar o webhook secret (segurança)
    // A AbacatePay envia o secret como query param: ?webhookSecret=xxx
    const { searchParams } = new URL(request.url)
    const receivedSecret = searchParams.get('webhookSecret')
    const expectedSecret = process.env.ABACATEPAY_WEBHOOK_SECRET

    if (expectedSecret && receivedSecret !== expectedSecret) {
      console.warn('Webhook recebido com secret inválido. Esperado:', expectedSecret, 'Recebido:', receivedSecret)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    } else if (!expectedSecret) {
      console.warn('Atenção: ABACATEPAY_WEBHOOK_SECRET não está configurado. Webhook aceito sem validação de segurança.')
    }

    // 2. Ler o payload do evento
    const payload = await request.json()
    const { event, data, devMode } = payload

    // Log para debug (remova em produção se desejar)
    console.log(`[AbacatePay Webhook] Evento: ${event}`, { devMode, billingId: data?.id })

    // 3. Só processar o evento de pagamento confirmado
    const eventName = (event || '').toUpperCase()
    if (eventName !== 'BILLING.PAID') {
      // Responde 200 para outros eventos (evita retry desnecessário)
      return NextResponse.json({ received: true, processed: false })
    }

    // 4. Extrair metadata com os IDs do nosso sistema
    const { userId, ebookId } = data?.metadata || {}

    if (!userId || !ebookId) {
      console.error('[AbacatePay Webhook] metadata incompleto:', data?.metadata)
      return NextResponse.json({ error: 'Metadata inválido' }, { status: 400 })
    }

    const billingId = data?.id
    const totalAmount = (data?.amount || 0) / 100 // AbacatePay retorna em centavos

    // 5. Usar a service role para operar sem restrições de RLS
    const supabase = createServiceClient()

    // 6. Verificar se já foi processado (idempotência)
    const { data: alreadyPaid } = await supabase
      .from('pending_checkouts')
      .select('id, status')
      .eq('billing_id', billingId)
      .eq('status', 'paid')
      .single()

    if (alreadyPaid) {
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
