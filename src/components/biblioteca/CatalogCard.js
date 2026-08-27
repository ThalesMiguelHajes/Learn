'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconCheckCircle, IconBookOpen, IconCart, IconDevices } from '@/components/icons'

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
      className="glass-card ebook-card animate-in catalog-card"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {hasEbook && (
        <div className="catalog-card-owned-badge">
          <IconCheckCircle size={14} /> Na Biblioteca
        </div>
      )}
      {ebook.cover_url ? (
        <img
          src={ebook.cover_url}
          alt={`Capa de ${ebook.title}`}
          className="ebook-card-cover"
        />
      ) : (
        <div className="ebook-card-cover ebook-card-cover-placeholder">
          <IconDevices size={40} />
        </div>
      )}
      <div className="ebook-card-body">
        <h3 className="ebook-card-title">{ebook.title}</h3>
        {ebook.description && (
          <p className="ebook-card-desc">{ebook.description}</p>
        )}

        {error && (
          <p className="form-error mb-xs">{error}</p>
        )}

        <div className="ebook-card-footer">
          <span className="ebook-card-price">{hasEbook ? 'Adquirido' : priceFormatted}</span>
          <button
            id={`buy-ebook-${ebook.id}`}
            onClick={handleBuy}
            disabled={loading}
            className={`btn ${hasEbook ? 'btn-secondary' : 'btn-primary'} btn-sm`}
          >
            {loading ? (
              <><span className="spinner" /> Aguarde...</>
            ) : hasEbook ? (
              <><IconBookOpen size={14} /> Ler</>
            ) : (
              <><IconCart size={14} /> Comprar</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
