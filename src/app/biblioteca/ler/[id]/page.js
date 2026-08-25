import { createClient } from '@/lib/supabase/server'
import PdfReader from '@/components/biblioteca/PdfReader'
import { redirect } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: ebook } = await supabase
    .from('ebooks')
    .select('title')
    .eq('id', id)
    .single()

  return {
    title: ebook ? `Lendo: ${ebook.title} — KodaBooks` : 'Leitor — KodaBooks',
  }
}

export default async function LerEbookPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  // Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify ownership
  const { data: ownership } = await supabase
    .from('user_ebooks')
    .select('id')
    .eq('user_id', user.id)
    .eq('ebook_id', id)
    .single()

  if (!ownership) {
    return (
      <div className="pdf-error" style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Acesso Negado</h2>
          <p>Você não possui acesso a este e-book.</p>
        </div>
      </div>
    )
  }

  // Verify ebook file type
  const { data: ebook } = await supabase
    .from('ebooks')
    .select('title, file_type')
    .eq('id', id)
    .single()

  if (!ebook || ebook.file_type !== 'pdf') {
    return (
      <div className="pdf-error" style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Formato não suportado</h2>
          <p>O leitor integrado atualmente suporta apenas arquivos PDF.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ler-ebook-page">
      <div className="page-header" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="page-header-left">
          <h2>📖 Lendo: <span className="text-gradient">{ebook.title}</span></h2>
        </div>
      </div>

      <div className="glass-card pdf-reader-wrapper">
        <PdfReader ebookId={id} />
      </div>
    </div>
  )
}
