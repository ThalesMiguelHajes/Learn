'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { IconCheckCircle, IconBookOpen, IconCart, IconDevices } from '@/components/icons'

export default function CatalogCard({ ebook, index, hasEbook = false, itemType = 'ebook' }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const priceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(ebook.price || 0)

  async function handleBuy() {
    if (hasEbook) {
      if (itemType === 'material') {
        router.push(`/biblioteca/material/${ebook.id}`)
      } else if (itemType === 'course') {
        router.push(`/biblioteca/cursos/${ebook.id}`)
      } else {
        router.push(`/biblioteca/livro/${ebook.id}`)
      }
      return
    }

    setLoading(true)
    // Redireciona para a página de checkout para coletar CPF e Telefone (o checkout foi refatorado para ler type na query string)
    router.push(`/biblioteca/checkout/${ebook.id}?type=${itemType}`)
  }

  let typeBadge = 'E-book'
  if (itemType === 'material') typeBadge = ebook.material_type ? ebook.material_type.toUpperCase() : 'Material'
  if (itemType === 'course') typeBadge = 'Curso'

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
        <div className="ebook-card-cover">
          <Image
            src={ebook.cover_url}
            alt={`Capa de ${ebook.title}`}
            fill
            sizes="(max-width: 768px) 45vw, 220px"
          />
        </div>
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
          <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>{typeBadge}</span>
          <span className="ebook-card-price" style={{ marginLeft: 'auto', marginRight: '0.5rem' }}>{hasEbook ? 'Adquirido' : priceFormatted}</span>
          <button
            id={`buy-ebook-${ebook.id}`}
            onClick={handleBuy}
            disabled={loading}
            className={`btn ${hasEbook ? 'btn-secondary' : 'btn-primary'} btn-sm`}
          >
            {loading ? (
              <><span className="spinner" /> Aguarde...</>
            ) : hasEbook ? (
              <><IconBookOpen size={14} /> Acessar</>
            ) : (
              <><IconCart size={14} /> Comprar</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
