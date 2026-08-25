import { createClient } from '@/lib/supabase/server'
import EbookCard from '@/components/biblioteca/EbookCard'

export default async function BibliotecaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch only ebooks assigned to this user via the user_ebooks table
  const { data: userEbooks, error } = await supabase
    .from('user_ebooks')
    .select('ebooks(*)')
    .eq('user_id', user.id)

  const ebooks = userEbooks
    ?.map((ue) => ue.ebooks)
    .filter((e) => e && e.is_active)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || []

  return (
    <>
      <div className="page-header" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="page-header-left">
          <h1>📚 Minha Biblioteca</h1>
          <p>Seus e-books disponíveis para leitura e download</p>
        </div>
      </div>

      {!ebooks || ebooks.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <h3>Sua biblioteca está vazia</h3>
            <p>Quando você receber acesso a e-books, eles aparecerão aqui para você baixar e ler.</p>
          </div>
        </div>
      ) : (
        <div className="ebook-grid">
          {ebooks.map((ebook, index) => (
            <EbookCard key={ebook.id} ebook={ebook} index={index} />
          ))}
        </div>
      )}
    </>
  )
}
