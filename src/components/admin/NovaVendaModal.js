'use client'

import { useState } from 'react'
import { createSale } from '@/app/actions/sales'

export default function NovaVendaModal({ users, ebooks, onClose }) {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const [selectedUser, setSelectedUser] = useState('')
  const [selectedEbooks, setSelectedEbooks] = useState([])
  const [amount, setAmount] = useState('')

  function handleEbookToggle(id) {
    if (selectedEbooks.includes(id)) {
      setSelectedEbooks(selectedEbooks.filter(e => e !== id))
    } else {
      setSelectedEbooks([...selectedEbooks, id])
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    const res = await createSale({
      userId: selectedUser,
      ebookIds: selectedEbooks,
      totalAmount: amount
    })

    if (res.success) {
      setFeedback({ type: 'success', msg: 'Venda registrada e e-books atribuídos com sucesso!' })
      setTimeout(() => {
        onClose()
      }, 1500)
    } else {
      setFeedback({ type: 'error', msg: res.error })
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay}>
      <div className="glass-card" style={styles.modal}>
        <div style={styles.header}>
          <h3>Registrar Nova Venda</h3>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <label className="form-label">Cliente (Comprador)</label>
            <select
              className="form-control"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              required
            >
              <option value="">Selecione um cliente...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">E-books Vendidos</label>
            <div style={styles.ebookList}>
              {ebooks.map(ebook => (
                <label key={ebook.id} style={styles.ebookItem}>
                  <input
                    type="checkbox"
                    checked={selectedEbooks.includes(ebook.id)}
                    onChange={() => handleEbookToggle(ebook.id)}
                  />
                  <span>{ebook.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Valor Cobrado (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              placeholder="Ex: 49.90"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !selectedUser || selectedEbooks.length === 0}>
              {loading ? <span className="spinner spinner-sm"></span> : 'Registrar Venda'}
            </button>
          </div>
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
    maxWidth: '500px',
    padding: 'var(--space-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-sm)'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '1.5rem',
    cursor: 'pointer'
  },
  ebookList: {
    maxHeight: '150px',
    overflowY: 'auto',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-xs)'
  },
  ebookItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-xs) var(--space-sm)',
    cursor: 'pointer'
  }
}
