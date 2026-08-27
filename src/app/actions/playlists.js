'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPlaylist(title) {
  if (!title || title.trim() === '') {
    return { error: 'O título da playlist é obrigatório.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const { data, error } = await supabase
    .from('playlists')
    .insert([{ user_id: user.id, title: title.trim() }])
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar playlist:', error)
    return { error: 'Erro ao criar playlist.' }
  }

  revalidatePath('/biblioteca')
  return { success: true, playlist: data }
}

export async function addEbookToPlaylist(playlistId, ebookId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const { data: playlist } = await supabase
    .from('playlists')
    .select('id')
    .eq('id', playlistId)
    .eq('user_id', user.id)
    .single()

  if (!playlist) {
    return { error: 'Playlist não encontrada.' }
  }

  const { error } = await supabase
    .from('playlist_ebooks')
    .insert([{ playlist_id: playlistId, ebook_id: ebookId }])

  if (error) {
    // Código 23505 é violação de constraint unique (livro já está na playlist)
    if (error.code === '23505') {
      return { error: 'Este e-book já está nesta playlist.' }
    }
    console.error('Erro ao adicionar e-book na playlist:', error)
    return { error: 'Erro ao adicionar à playlist.' }
  }

  revalidatePath('/biblioteca')
  revalidatePath(`/biblioteca/livro/${ebookId}`)
  return { success: true }
}

export async function getUserPlaylists() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.', data: [] }
  }

  // Fetch playlists along with the count of ebooks inside them (optional, but good for UI)
  const { data, error } = await supabase
    .from('playlists')
    .select(`
      id, 
      title, 
      created_at,
      playlist_ebooks ( count )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar playlists:', error)
    return { error: 'Erro ao buscar playlists.', data: [] }
  }

  return { success: true, data }
}
