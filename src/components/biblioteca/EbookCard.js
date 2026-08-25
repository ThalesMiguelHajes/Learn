'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function EbookCard({ ebook, index }) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      // Call the secure download API
      const response = await fetch(`/api/download/${ebook.id}`)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        alert(data.error || 'Erro ao baixar o e-book.')
        return
      }

      // Get the blob and create download link
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = ebook.file_name || `${ebook.title}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      alert('Erro ao baixar o e-book. Tente novamente.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      className="glass-card ebook-card animate-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
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
        <div className="ebook-card-footer" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {ebook.file_type && (
            <span className="badge badge-info" style={{ marginRight: 'auto' }}>
              {ebook.file_type.toUpperCase()}
            </span>
          )}
          {ebook.file_type === 'pdf' && (
            <Link 
              href={`/biblioteca/ler/${ebook.id}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.4rem 0.8rem' }}
            >
              📖 Ler
            </Link>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleDownload}
            disabled={downloading}
            id={`download-${ebook.id}`}
            style={{ padding: '0.4rem 0.8rem' }}
            title="Baixar Arquivo"
          >
            {downloading ? (
              <span className="spinner spinner-sm" />
            ) : (
              '⬇️'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
