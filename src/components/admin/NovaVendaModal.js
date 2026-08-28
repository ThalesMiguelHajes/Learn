'use client'

import { useState, useMemo } from 'react'
import { createSale } from '@/app/actions/sales'
import Modal from '@/components/ui/Modal'
import Combobox from '@/components/ui/Combobox'
import { IconSearch } from '@/components/icons'

export default function NovaVendaModal({ users, ebooks, onClose }) {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const [selectedUser, setSelectedUser] = useState('')
  const [selectedEbooks, setSelectedEbooks] = useState([])
  const [amount, setAmount] = useState('')
  const [ebookSearch, setEbookSearch] = useState('')

  const userOptions = useMemo(
    () => users.map(u => ({ value: u.id, label: `${u.full_name} (${u.email})` })),
    [users]
  )

  const filteredEbooks = useMemo(() => {
    if (!ebookSearch.trim()) return ebooks
    const term = ebookSearch.trim().toLowerCase()
    return ebooks.filter(e => e.title.toLowerCase().includes(term))
  }, [ebooks, ebookSearch])

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
          <Combobox
            options={userOptions}
            value={selectedUser}
            onChange={setSelectedUser}
            placeholder="Digite para buscar um cliente..."
            emptyLabel="Nenhum cliente encontrado."
          />
        </div>

        <div className="form-group">
          <label className="form-label">E-books Vendidos</label>
          <div className="search-bar mb-sm">
            <span className="search-icon"><IconSearch size={16} /></span>
            <input
              type="text"
              className="form-input"
              placeholder="Buscar e-book..."
              value={ebookSearch}
              onChange={(e) => setEbookSearch(e.target.value)}
            />
          </div>
          <div className="checkbox-list" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', maxHeight: '150px' }}>
            {filteredEbooks.length === 0 ? (
              <p className="text-tertiary" style={{ padding: 'var(--space-sm)', textAlign: 'center', fontSize: '0.875rem' }}>
                Nenhum e-book encontrado.
              </p>
            ) : (
              filteredEbooks.map(ebook => (
                <label key={ebook.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedEbooks.includes(ebook.id)}
                    onChange={() => handleEbookToggle(ebook.id)}
                  />
                  <span>{ebook.title}</span>
                </label>
              ))
            )}
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
