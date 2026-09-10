'use client'

import { useState, useMemo } from 'react'
import { createSale } from '@/app/actions/sales'
import Modal from '@/components/ui/Modal'
import Combobox from '@/components/ui/Combobox'
import { IconSearch } from '@/components/icons'

export default function NovaVendaModal({ users, products, onClose }) {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const [selectedUser, setSelectedUser] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [amount, setAmount] = useState('')
  const [search, setSearch] = useState('')

  const userOptions = useMemo(
    () => users.map(u => ({ value: u.id, label: `${u.full_name} (${u.email})` })),
    [users]
  )

  const allProducts = useMemo(() => {
    const list = []
    if (products?.ebooks) {
      products.ebooks.forEach(e => list.push({ ...e, type: 'ebook', label: `[E-book] ${e.title}` }))
    }
    if (products?.materials) {
      products.materials.forEach(m => list.push({ ...m, type: 'material', label: `[Material] ${m.title}` }))
    }
    if (products?.courses) {
      products.courses.forEach(c => list.push({ ...c, type: 'course', label: `[Curso] ${c.title}` }))
    }
    return list
  }, [products])

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return allProducts
    const term = search.trim().toLowerCase()
    return allProducts.filter(p => p.title.toLowerCase().includes(term))
  }, [allProducts, search])

  function handleItemToggle(item) {
    const exists = selectedItems.find(i => i.id === item.id && i.type === item.type)
    if (exists) {
      setSelectedItems(selectedItems.filter(i => !(i.id === item.id && i.type === item.type)))
    } else {
      setSelectedItems([...selectedItems, { id: item.id, type: item.type }])
    }
  }

  function isSelected(item) {
    return selectedItems.some(i => i.id === item.id && i.type === item.type)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    const res = await createSale({
      userId: selectedUser,
      items: selectedItems,
      totalAmount: amount
    })

    if (res.success) {
      setFeedback({ type: 'success', msg: 'Venda registrada e produtos atribuídos com sucesso!' })
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
          <label className="form-label">Produtos Vendidos</label>
          <div className="search-bar mb-sm">
            <span className="search-icon"><IconSearch size={16} /></span>
            <input
              type="text"
              className="form-input"
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="checkbox-list" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', maxHeight: '150px' }}>
            {filteredProducts.length === 0 ? (
              <p className="text-tertiary" style={{ padding: 'var(--space-sm)', textAlign: 'center', fontSize: '0.875rem' }}>
                Nenhum produto encontrado.
              </p>
            ) : (
              filteredProducts.map(product => (
                <label key={`${product.type}-${product.id}`} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={isSelected(product)}
                    onChange={() => handleItemToggle(product)}
                  />
                  <span>
                    <strong className="text-secondary" style={{ fontSize: '0.8rem', marginRight: '6px' }}>
                      [{product.type === 'ebook' ? 'E-book' : product.type === 'material' ? 'Material' : 'Curso'}]
                    </strong>
                    {product.title}
                  </span>
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
          <button type="submit" className="btn btn-primary" disabled={loading || !selectedUser || selectedItems.length === 0}>
            {loading ? <span className="spinner" /> : 'Registrar Venda'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
