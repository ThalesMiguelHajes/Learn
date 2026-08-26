import { createClient } from '@/lib/supabase/server'
import CatalogCard from '@/components/biblioteca/CatalogCard'
import SearchBar from '@/components/biblioteca/SearchBar'
import { Suspense } from 'react'

export const metadata = {
  title: 'Catálogo — KodaBooks',
}

export default async function CatalogoPage({ searchParams }) {
  const { q } = await searchParams || {}
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  let query = supabase
    .from('ebooks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  const { data: ebooks, error } = await query

  // Buscar os e-books que o usuário já possui
  let ownedEbookIds = []
  if (user) {
    const { data: userEbooks } = await supabase
      .from('user_ebooks')
      .select('ebook_id')
      .eq('user_id', user.id)
    
    if (userEbooks) {
      ownedEbookIds = userEbooks.map(ue => ue.ebook_id)
    }
  }

  return (
    <div className="biblioteca-page">
      <div className="page-header">
        <div>
          <h2>Catálogo de E-books</h2>
          <p className="text-secondary">Descubra novos conteúdos para expandir sua biblioteca digital.</p>
        </div>
      </div>
      
      <Suspense fallback={<div style={{height: '80px'}}>Carregando busca...</div>}>
        <SearchBar placeholder="Buscar no catálogo..." />
      </Suspense>

      {error && (
        <div className="toast-error" style={{
          padding: 'var(--space-md)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--error-soft)',
          color: 'var(--error)',
          marginBottom: 'var(--space-lg)'
        }}>
          Erro ao carregar o catálogo.
        </div>
      )}

      {!ebooks || ebooks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Nenhum resultado</h3>
          <p>Não encontramos nenhum e-book correspondente a "{q}". Tente outros termos!</p>
        </div>
      ) : (
        <div className="ebook-grid">
          {ebooks.map((ebook, idx) => {
            const hasEbook = ownedEbookIds.includes(ebook.id)
            return (
              <CatalogCard key={ebook.id} ebook={ebook} index={idx} hasEbook={hasEbook} />
            )
          })}
        </div>
      )}
    </div>
  )
}
