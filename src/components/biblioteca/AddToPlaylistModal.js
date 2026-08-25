'use client'

import { useState, useEffect } from 'react'
import { getUserPlaylists, createPlaylist, addEbookToPlaylist } from '@/app/actions/playlists'

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
    <div style={styles.overlay}>
      <div className="glass-card" style={styles.modal}>
        <div style={styles.header}>
          <h3>Adicionar à Playlist</h3>
          <button onClick={onClose} style={styles.closeBtn}>&times;</button>
        </div>

        {feedback && (
          <div style={{
            padding: 'var(--space-sm)',
            borderRadius: 'var(--radius-sm)',
            background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'var(--error-soft)',
            color: feedback.type === 'success' ? '#4ade80' : 'var(--error)',
            marginBottom: 'var(--space-md)',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            {feedback.msg}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-lg) 0' }}>
            <span className="spinner"></span>
          </div>
        ) : (
          <div style={styles.list}>
            {playlists.length === 0 ? (
              <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-md) 0' }}>
                Você ainda não tem playlists.
              </p>
            ) : (
              playlists.map((pl) => (
                <div key={pl.id} style={styles.playlistItem}>
                  <span>{pl.title}</span>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleAdd(pl.id)}
                  >
                    +
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <form onSubmit={handleCreatePlaylist} style={styles.createForm}>
          <input
            type="text"
            className="form-control"
            placeholder="Nome da nova playlist..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={creating || !newTitle.trim()}>
            {creating ? <span className="spinner spinner-sm"></span> : 'Criar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  modal: {
    width: '90%',
    maxWidth: '400px',
    padding: 'var(--space-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '1.5rem',
    cursor: 'pointer'
  },
  list: {
    maxHeight: '200px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)'
  },
  playlistItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--space-sm) var(--space-md)',
    background: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-md)'
  },
  createForm: {
    display: 'flex',
    gap: 'var(--space-sm)',
    marginTop: 'var(--space-sm)',
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: 'var(--space-md)'
  }
}
