import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

  const supabase = await createClient()

  // 1. Verificar se usuário está logado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

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
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: 'var(--space-2xl) var(--space-xl)',
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        marginBottom: 'var(--space-2xl)',
        fontFamily: 'var(--font-display)',
        color: 'var(--text-primary)',
        textAlign: 'center'
      }}>
        Finalizar Compra
      </h1>

      <CheckoutClient ebook={ebook} userProfile={profile} />
    </div>
  )
}
