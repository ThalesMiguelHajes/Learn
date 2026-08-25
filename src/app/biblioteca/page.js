import { createClient } from '@/lib/supabase/server'
import EbookCard from '@/components/biblioteca/EbookCard'
import Link from 'next/link'

export default async function BibliotecaPage({ searchParams }) {
  const { tab = 'livros' } = await searchParams || {}
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch ebooks
  const { data: userEbooks } = await supabase
    .from('user_ebooks')
    .select('ebooks(*)')
    .eq('user_id', user.id)

  const ebooks = userEbooks
    ?.map((ue) => ue.ebooks)
    .filter((e) => e && e.is_active)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || []

  // Fetch playlists
  const { data: playlists } = await supabase
    .from('playlists')
    .select(`
      id, 
      title, 
      created_at,
      playlist_ebooks ( count )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="page-header" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="page-header-left">
          <h1>📚 Minha Biblioteca</h1>
          <p>Gerencie seus e-books e coleções personalizadas.</p>
        </div>
      </div>

      <div className="biblioteca-tabs" style={{ display: 'flex', gap: 'var(--space-md)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <Link 
          href="/biblioteca?tab=livros" 
          className={`btn ${tab === 'livros' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Meus E-books
        </Link>
        <Link 
          href="/biblioteca?tab=playlists" 
          className={`btn ${tab === 'playlists' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Minhas Playlists
        </Link>
      </div>

      {tab === 'livros' ? (
        !ebooks || ebooks.length === 0 ? (
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
        )
      ) : (
        /* Aba de Playlists */
        !playlists || playlists.length === 0 ? (
          <div className="glass-card">
            <div className="empty-state">
              <div className="empty-icon">🗂️</div>
              <h3>Nenhuma playlist criada</h3>
              <p>Você ainda não organizou seus livros em coleções.</p>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: 'var(--space-sm)' }}>
                Vá até os detalhes de um e-book para adicionar e criar sua primeira playlist!
              </p>
            </div>
          </div>
        ) : (
          <div className="ebook-grid">
            {playlists.map((playlist, index) => (
              <Link
                key={playlist.id}
                href={`/biblioteca/playlist/${playlist.id}`}
                className="glass-card ebook-card animate-in"
                style={{ animationDelay: `${index * 80}ms`, textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
              >
                <div className="ebook-card-cover" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  background: 'var(--bg-tertiary)',
                  aspectRatio: '2/1', // wider aspect ratio for playlists
                  height: 'auto'
                }}>
                  🗂️
                </div>
                <div className="ebook-card-body" style={{ flex: 1 }}>
                  <h3 className="ebook-card-title">{playlist.title}</h3>
                  <div className="ebook-card-footer" style={{ marginTop: 'auto', paddingTop: 'var(--space-sm)' }}>
                    <span className="badge badge-info">{playlist.playlist_ebooks?.[0]?.count || 0} livros</span>
                    <span className="text-secondary" style={{ fontSize: '0.8rem', marginLeft: 'auto' }}>Ver Coleção &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </>
  )
}
