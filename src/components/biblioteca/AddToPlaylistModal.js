'use client'

import { useState, useEffect } from 'react'
import { getUserPlaylists, createPlaylist, addEbookToPlaylist } from '@/app/actions/playlists'
import Modal from '@/components/ui/Modal'
import { IconFolderPlus } from '@/components/icons'

export default function AddToPlaylistModal({ ebookId, onClose }) {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    fetchPlaylists()
  }, [])

  async function fetchPlaylists() {
    setLoading(true)
    const res = await getUserPlaylists()
    if (res.success) {
      setPlaylists(res.data)
    } else {
      setFeedback({ type: 'error', msg: res.error })
    }
    setLoading(false)
  }

  async function handleCreatePlaylist(e) {
    e.preventDefault()
    setCreating(true)
    setFeedback(null)

    const res = await createPlaylist(newTitle)
    if (res.success) {
      setNewTitle('')
      await fetchPlaylists() // reload list
      // Optionally auto-add to the new playlist:
      handleAdd(res.playlist.id)
    } else {
      setFeedback({ type: 'error', msg: res.error })
    }
    setCreating(false)
  }

  async function handleAdd(playlistId) {
    setFeedback(null)
    const res = await addEbookToPlaylist(playlistId, ebookId)
    if (res.success) {
      setFeedback({ type: 'success', msg: 'Adicionado com sucesso!' })
      setTimeout(() => {
        onClose()
      }, 1500)
    } else {
      setFeedback({ type: 'error', msg: res.error })
    }
  }

  return (
    <Modal title="Adicionar à Playlist" onClose={onClose} maxWidth="400px">
      {feedback && (
        <div className={`form-feedback form-feedback-${feedback.type} mb-md`}>
          {feedback.msg}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center" style={{ padding: 'var(--space-lg) 0' }}>
          <span className="spinner" />
        </div>
      ) : (
        <div className="flex flex-col gap-sm" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {playlists.length === 0 ? (
            <p className="text-secondary text-center" style={{ padding: 'var(--space-md) 0' }}>
              Você ainda não tem playlists.
            </p>
          ) : (
            playlists.map((pl) => (
              <div key={pl.id} className="flex justify-between items-center" style={{ padding: 'var(--space-sm) var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <span>{pl.title}</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleAdd(pl.id)}
                >
                  Adicionar
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <form onSubmit={handleCreatePlaylist} className="flex gap-sm mt-md" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Nome da nova playlist..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={creating || !newTitle.trim()}>
          {creating ? <span className="spinner" /> : <IconFolderPlus size={18} />}
        </button>
      </form>
    </Modal>
  )
}
