'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CatalogCard({ ebook, index, hasEbook = false }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const priceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(ebook.price || 0)

  async function handleBuy() {
    if (hasEbook) {
      router.push(`/biblioteca/livro/${ebook.id}`)
      return
    }

    setLoading(true)
    // Redireciona para a página de checkout para coletar CPF e Telefone
    router.push(`/biblioteca/checkout/${ebook.id}`)
  }

  return (
    <div
      className="glass-card ebook-card animate-in"
      style={{ animationDelay: `${index * 80}ms`, position: 'relative' }}
    >
      {hasEbook && (
        <div style={{
          position: 'absolute',
          top: 'var(--space-sm)',
          right: 'var(--space-sm)',
          background: 'var(--success)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          zIndex: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          ✅ Na Biblioteca
        </div>
      )}
      {ebook.cover_url ? (
        <img
          src={ebook.cover_url}
          alt={`Capa de ${ebook.title}`}
          className="ebook-card-cover"
        />
      ) : (
        <div className="ebook-card-cover" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          background: 'var(--bg-tertiary)',
        }}>
          📖
        </div>
      )}
      <div className="ebook-card-body">
        <h3 className="ebook-card-title">{ebook.title}</h3>
        {ebook.description && (
          <p className="ebook-card-desc">{ebook.description}</p>
        )}

        {error && (
          <p style={{
            fontSize: '0.78rem',
            color: 'var(--error, #f87171)',
            marginBottom: 'var(--space-xs)',
            lineHeight: 1.4,
          }}>
            {error}
          </p>
        )}

        <div className="ebook-card-footer">
          <span className="ebook-card-price">{hasEbook ? 'Adquirido' : priceFormatted}</span>
          <button
            id={`buy-ebook-${ebook.id}`}
            onClick={handleBuy}
            disabled={loading}
            className={`btn ${hasEbook ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
          >
            {loading ? '⏳ Aguarde...' : (hasEbook ? '📖 Ler' : '🛒 Comprar')}
          </button>
        </div>
      </div>
    </div>
  )
}
