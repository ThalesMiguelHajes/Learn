import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

// POST /api/checkout
// Recebe { itemId, itemType, cpf, phone } e cria uma cobrança PIX na AbacatePay
export async function POST(request) {
  try {
    const { itemId, itemType, cpf, phone, ebookId } = await request.json()

    // Para retrocompatibilidade com o frontend atual que ainda usa ebookId
    const finalItemId = itemId || ebookId
    const finalItemType = itemType || 'ebook'

    if (!finalItemId) {
      return NextResponse.json({ error: 'itemId é obrigatório.' }, { status: 400 })
    }

    if (!['ebook', 'material', 'course'].includes(finalItemType)) {
      return NextResponse.json({ error: 'itemType inválido.' }, { status: 400 })
    }

    if (!cpf || !phone) {
      return NextResponse.json({ error: 'CPF e Telefone são obrigatórios.' }, { status: 400 })
    }

    const cpfDigits = String(cpf).replace(/\D/g, '')
    const phoneDigits = String(phone).replace(/\D/g, '')

    if (cpfDigits.length !== 11) {
      return NextResponse.json({ error: 'CPF inválido.' }, { status: 400 })
    }

    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      return NextResponse.json({ error: 'Telefone inválido.' }, { status: 400 })
    }

    // 1. Autenticar o usuário via sessão (cookie SSR)
    const { user } = await getUser()
    const supabase = await createClient()

    if (!user) {
      return NextResponse.json({ error: 'Você precisa estar logado para comprar.' }, { status: 401 })
    }

    // 2. Verificar se o usuário já possui este item (evitar cobrar duas vezes)
    let tableName = ''
    let idColumn = ''
    let itemTableName = ''
    let itemPrefix = ''

    if (finalItemType === 'ebook') {
      tableName = 'user_ebooks'
      idColumn = 'ebook_id'
      itemTableName = 'ebooks'
      itemPrefix = 'E-book'
    } else if (finalItemType === 'material') {
      tableName = 'user_materials'
      idColumn = 'material_id'
      itemTableName = 'materials'
      itemPrefix = 'Material'
    } else if (finalItemType === 'course') {
      tableName = 'user_courses'
      idColumn = 'course_id'
      itemTableName = 'courses'
      itemPrefix = 'Curso'
    }

    const { data: existing } = await supabase
      .from(tableName)
      .select('id')
      .eq('user_id', user.id)
      .eq(idColumn, finalItemId)
      .single()

    if (existing) {
      return NextResponse.json({ error: `Você já possui este ${finalItemType} na sua biblioteca.` }, { status: 409 })
    }

    // 3. Buscar dados do item
    const { data: item, error: itemError } = await supabase
      .from(itemTableName)
      .select('id, title, price, is_active')
      .eq('id', finalItemId)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 })
    }

    if (!item.is_active) {
      return NextResponse.json({ error: 'Este item não está disponível para compra.' }, { status: 403 })
    }

    // 3.5 Buscar dados do perfil do usuário para enviar o 'customer'
    // E já atualiza o CPF e Telefone no banco
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({ cpf: cpfDigits, phone: phoneDigits })
      .eq('id', user.id)
      .select('full_name, email, cpf, phone')
      .single()

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError)
    }

    const customerName = profile?.full_name || user.user_metadata?.full_name || 'Cliente Learn'
    const customerEmail = profile?.email || user.email
    const customerCpf = profile?.cpf || cpf
    const customerPhone = profile?.phone || phone

    // 4. Criar cobrança na AbacatePay via REST
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin || (host ? `${protocol}://${host}` : 'http://localhost:3000')

    const abacateResponse = await fetch('https://api.abacatepay.com/v1/billing/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACATEPAY_API_KEY}`,
      },
      body: JSON.stringify({
        frequency: 'ONE_TIME',
        methods: ['PIX'],
        customer: {
          name: customerName,
          email: customerEmail,
          cellphone: customerPhone,
          taxId: customerCpf,
        },
        products: [
          {
            externalId: item.id,
            name: item.title,
            description: `${itemPrefix}: ${item.title}`,
            quantity: 1,
            // AbacatePay recebe o valor em centavos (inteiro)
            price: Math.round(item.price * 100),
          },
        ],
        // metadata é devolvido no webhook — usamos para identificar a venda
        metadata: {
          userId: user.id,
          itemId: item.id,
          itemType: finalItemType,
        },
        returnUrl: `${baseUrl}/biblioteca/sucesso?item=${item.id}&type=${finalItemType}`,
        completionUrl: `${baseUrl}/biblioteca/sucesso?item=${item.id}&type=${finalItemType}`,
      }),
    })

    const abacateData = await abacateResponse.json()

    if (!abacateResponse.ok || !abacateData?.data?.url) {
      console.error('Erro na AbacatePay:', abacateData)
      return NextResponse.json({ error: 'Não foi possível criar o pagamento. Tente novamente.' }, { status: 502 })
    }

    const { id: billingId, url: billingUrl } = abacateData.data

    // 5. Salvar o checkout pendente no Supabase
    await supabase
      .from('pending_checkouts')
      .insert({
        user_id: user.id,
        item_id: item.id,
        item_type: finalItemType,
        billing_id: billingId,
        billing_url: billingUrl,
        status: 'pending',
      })

    // 6. Retornar a URL de pagamento para o frontend redirecionar
    return NextResponse.json({ url: billingUrl })
  } catch (err) {
    console.error('Erro inesperado no checkout:', err)
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }
}
