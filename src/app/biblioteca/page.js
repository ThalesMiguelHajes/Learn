import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import EbookCard from '@/components/biblioteca/EbookCard'
import Link from 'next/link'
import { IconBooks, IconBookOpen, IconFolder } from '@/components/icons'

export default async function BibliotecaPage({ searchParams }) {
  const { tab = 'livros' } = await searchParams || {}
  const { user } = await requireAuth()
  const supabase = await createClient()

  // Fetch ebooks
  const { data: userEbooks } = await supabase
    .from('user_ebooks')
    .select('ebooks(*)')
    .eq('user_id', user.id)

  const ebooks = userEbooks
    ?.map((ue) => ue.ebooks)
    .filter((e) => e && e.is_active)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || []

  // Fetch materials
  const { data: userMaterials } = await supabase
    .from('user_materials')
    .select('materials(*)')
    .eq('user_id', user.id)

  const materials = userMaterials
    ?.map((um) => um.materials)
    .filter((m) => m && m.is_active)
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
      <div className="page-header mb-xl">
        <div className="page-header-left">
          <h1 className="flex items-center gap-sm"><IconBooks size={26} /> Minha Biblioteca</h1>
          <p>Gerencie seus e-books e coleções personalizadas.</p>
        </div>
      </div>

      <div className="tab-bar mb-xl">
        <Link
          href="/biblioteca?tab=livros"
          className={`btn ${tab === 'livros' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Meus E-books
        </Link>
        <Link
          href="/biblioteca?tab=materiais"
          className={`btn ${tab === 'materiais' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Meus Materiais
        </Link>
        <Link
          href="/biblioteca?tab=playlists"
          className={`btn ${tab === 'playlists' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Minhas Playlists
        </Link>
      </div>

      {tab === 'livros' && (
        !ebooks || ebooks.length === 0 ? (
          <div className="glass-card">
            <div className="empty-state">
              <div className="empty-icon"><IconBookOpen size={40} /></div>
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
      )}

      {tab === 'materiais' && (
        !materials || materials.length === 0 ? (
          <div className="glass-card">
            <div className="empty-state">
              <div className="empty-icon"><IconBookOpen size={40} /></div>
              <h3>Nenhum material encontrado</h3>
              <p>Quando você comprar ou receber materiais, eles aparecerão aqui.</p>
            </div>
          </div>
        ) : (
          <div className="ebook-grid">
            {materials.map((material, index) => (
              <EbookCard key={material.id} ebook={material} isMaterial={true} index={index} />
            ))}
          </div>
        )
      )}

      {tab === 'playlists' && (
        /* Aba de Playlists */
        !playlists || playlists.length === 0 ? (
          <div className="glass-card">
            <div className="empty-state">
              <div className="empty-icon"><IconFolder size={40} /></div>
              <h3>Nenhuma playlist criada</h3>
              <p>Você ainda não organizou seus livros em coleções.</p>
              <p className="text-secondary mt-sm" style={{ fontSize: '0.9rem' }}>
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
                className="glass-card ebook-card animate-in playlist-card"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="ebook-card-cover ebook-card-cover-placeholder playlist-card-cover">
                  <IconFolder size={40} />
                </div>
                <div className="ebook-card-body playlist-card-body">
                  <h3 className="ebook-card-title">{playlist.title}</h3>
                  <div className="ebook-card-footer mt-auto">
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
