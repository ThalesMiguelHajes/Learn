import { createClient } from '@/lib/supabase/server'
import EbookCard from '@/components/biblioteca/EbookCard'

export default async function BibliotecaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch only ebooks assigned to this user
  const { data: ebooks, error } = await supabase
    .from('ebooks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // The RLS policy already filters to only show ebooks the user owns
  // via the user_ebooks relationship

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
