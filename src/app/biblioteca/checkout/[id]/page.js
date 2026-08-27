import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import CheckoutClient from '@/components/biblioteca/CheckoutClient'

export const metadata = {
  title: 'Finalizar Compra — KodaBooks',
}

export default async function CheckoutPage({ params }) {
  // `params` is a Promise in Next.js 15+, need to await it
  const { id: ebookId } = await params

  if (!ebookId) {
    redirect('/biblioteca')
  }

  const { user } = await requireAuth()
  const supabase = await createClient()

  // 2. Buscar o e-book
  const { data: ebook } = await supabase
    .from('ebooks')
    .select('id, title, cover_url, price, is_active')
    .eq('id', ebookId)
    .single()

  if (!ebook || !ebook.is_active) {
    redirect('/biblioteca')
  }

  // 3. Verificar se o usuário já tem o e-book
  const { data: hasEbook } = await supabase
    .from('user_ebooks')
    .select('id')
    .eq('user_id', user.id)
    .eq('ebook_id', ebookId)
    .single()

  if (hasEbook) {
    redirect(`/biblioteca/sucesso?ebook=${ebookId}`)
  }

  // 4. Buscar o perfil do usuário para pré-preencher CPF e Telefone (caso existam)
  const { data: profile } = await supabase
    .from('profiles')
    .select('cpf, phone')
    .eq('id', user.id)
    .single()

  return (
    <div className="checkout-page">
      <h1 className="checkout-page-title">
        Finalizar Compra
      </h1>

      <CheckoutClient ebook={ebook} userProfile={profile} />
    </div>
  )
}
