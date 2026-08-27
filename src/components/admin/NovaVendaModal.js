'use client'

import { useState } from 'react'
import { createSale } from '@/app/actions/sales'
import Modal from '@/components/ui/Modal'

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
    <Modal title="Registrar Nova Venda" onClose={onClose} maxWidth="500px">
      {feedback && (
        <div className={`form-feedback form-feedback-${feedback.type} mb-md`}>
          {feedback.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label">Cliente (Comprador)</label>
          <select
            className="form-input"
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

        <div className="form-group">
          <label className="form-label">E-books Vendidos</label>
          <div className="checkbox-list" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', maxHeight: '150px' }}>
            {ebooks.map(ebook => (
              <label key={ebook.id} className="checkbox-item">
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

        <div className="form-group">
          <label className="form-label">Valor Cobrado (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="form-input"
            placeholder="Ex: 49.90"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-sm mt-md">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading || !selectedUser || selectedEbooks.length === 0}>
            {loading ? <span className="spinner" /> : 'Registrar Venda'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
