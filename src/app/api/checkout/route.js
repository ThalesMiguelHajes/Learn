import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/checkout
// Recebe { ebookId } e cria uma cobrança PIX na AbacatePay
export async function POST(request) {
  try {
    const { ebookId, cpf, phone } = await request.json()

    if (!ebookId) {
      return NextResponse.json({ error: 'ebookId é obrigatório.' }, { status: 400 })
    }

    if (!cpf || !phone) {
      return NextResponse.json({ error: 'CPF e Telefone são obrigatórios.' }, { status: 400 })
    }

    // 1. Autenticar o usuário via sessão (cookie SSR)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Você precisa estar logado para comprar.' }, { status: 401 })
    }

    // 2. Verificar se o usuário já possui este e-book (evitar cobrar duas vezes)
    const { data: existing } = await supabase
      .from('user_ebooks')
      .select('id')
      .eq('user_id', user.id)
      .eq('ebook_id', ebookId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Você já possui este e-book na sua biblioteca.' }, { status: 409 })
    }

    // 3. Buscar dados do e-book
    const { data: ebook, error: ebookError } = await supabase
      .from('ebooks')
      .select('id, title, price, is_active')
      .eq('id', ebookId)
      .single()

    if (ebookError || !ebook) {
      return NextResponse.json({ error: 'E-book não encontrado.' }, { status: 404 })
    }

    if (!ebook.is_active) {
      return NextResponse.json({ error: 'Este e-book não está disponível para compra.' }, { status: 403 })
    }

    // 3.5 Buscar dados do perfil do usuário para enviar o 'customer'
    // E já atualiza o CPF e Telefone no banco
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({ cpf, phone })
      .eq('id', user.id)
      .select('full_name, email, cpf, phone')
      .single()

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError)
    }

    const customerName = profile?.full_name || user.user_metadata?.full_name || 'Cliente KodaBooks'
    const customerEmail = profile?.email || user.email
    const customerCpf = profile?.cpf || cpf
    const customerPhone = profile?.phone || phone

    // 4. Criar cobrança na AbacatePay via REST
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

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
            externalId: ebook.id,
            name: ebook.title,
            description: `E-book: ${ebook.title}`,
            quantity: 1,
            // AbacatePay recebe o valor em centavos (inteiro)
            price: Math.round(ebook.price * 100),
          },
        ],
        // metadata é devolvido no webhook — usamos para identificar userId e ebookId
        metadata: {
          userId: user.id,
          ebookId: ebook.id,
        },
        returnUrl: `${baseUrl}/biblioteca/sucesso?ebook=${ebook.id}`,
        completionUrl: `${baseUrl}/biblioteca/sucesso?ebook=${ebook.id}`,
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
        ebook_id: ebook.id,
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
