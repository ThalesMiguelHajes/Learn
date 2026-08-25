'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function EbookActions({ ebookId, fileType, title, fileName }) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      const response = await fetch(`/api/download/${ebookId}`)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        alert(data.error || 'Erro ao baixar o e-book.')
        return
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || `${title}.${fileType || 'pdf'}`
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
    <div className="ebook-actions" style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
      {fileType === 'pdf' && (
        <Link 
          href={`/biblioteca/ler/${ebookId}`}
          className="btn btn-primary"
          style={{ flex: 1, justifyContent: 'center' }}
        >
          📖 Ler Agora
        </Link>
      )}
      <button
        className="btn btn-secondary"
        onClick={handleDownload}
        disabled={downloading}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        {downloading ? (
          <><span className="spinner" style={{ marginRight: '8px' }} /> Baixando...</>
        ) : (
          '⬇️ Fazer Download'
        )}
      </button>
    </div>
  )
}
