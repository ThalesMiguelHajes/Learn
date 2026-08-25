import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EbookCard from '@/components/biblioteca/EbookCard'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: playlist } = await supabase
    .from('playlists')
    .select('title')
    .eq('id', id)
    .single()

  return {
    title: playlist ? `${playlist.title} — KodaBooks` : 'Playlist — KodaBooks',
  }
}

export default async function PlaylistPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar detalhes da playlist verificando propriedade (RLS handles this but we enforce query)
  const { data: playlist } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!playlist) {
    return (
      <div className="pdf-error" style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Playlist não encontrada</h2>
          <p>Esta playlist não existe ou você não tem permissão para vê-la.</p>
          <Link href="/biblioteca?tab=playlists" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
            Voltar para Playlists
          </Link>
        </div>
      </div>
    )
  }

  // Buscar os livros desta playlist
  const { data: playlistEbooks } = await supabase
    .from('playlist_ebooks')
    .select('ebooks(*)')
    .eq('playlist_id', id)
    .order('added_at', { ascending: false })

  const ebooks = playlistEbooks
    ?.map((pe) => pe.ebooks)
    .filter((e) => e && e.is_active) || []

  return (
    <div className="playlist-page">
      <Link href="/biblioteca?tab=playlists" className="btn-icon" style={{ marginBottom: 'var(--space-md)', width: 'auto', padding: '0 var(--space-sm)' }}>
        &larr; Voltar
      </Link>

      <div className="page-header" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="page-header-left">
          <h1>🗂️ {playlist.title}</h1>
          <p className="text-secondary">{ebooks.length} e-book{ebooks.length !== 1 ? 's' : ''} nesta coleção.</p>
        </div>
      </div>

      {!ebooks || ebooks.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>Playlist Vazia</h3>
            <p>Você ainda não adicionou nenhum e-book a esta playlist.</p>
          </div>
        </div>
      ) : (
        <div className="ebook-grid">
          {ebooks.map((ebook, index) => (
            <EbookCard key={ebook.id} ebook={ebook} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
