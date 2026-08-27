'use client'

import { useState } from 'react'
import Link from 'next/link'
import AddToPlaylistModal from './AddToPlaylistModal'
import { IconBookOpen, IconDownload, IconFolder } from '@/components/icons'

export default function EbookActions({ ebookId, fileType, title, fileName }) {
  const [downloading, setDownloading] = useState(false)
  const [showModal, setShowModal] = useState(false)

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
    <>
      <div className="ebook-actions flex gap-sm mt-lg">
        {fileType === 'pdf' && (
          <Link
            href={`/biblioteca/ler/${ebookId}`}
            className="btn btn-primary justify-center"
            style={{ flex: 1 }}
          >
            <IconBookOpen size={16} /> Ler Agora
          </Link>
        )}
        <button
          className="btn btn-secondary justify-center"
          onClick={handleDownload}
          disabled={downloading}
          style={{ flex: 1 }}
        >
          {downloading ? (
            <><span className="spinner" style={{ marginRight: '8px' }} /> Baixando...</>
          ) : (
            <><IconDownload size={16} /> Download</>
          )}
        </button>
        <button
          className="btn btn-secondary justify-center"
          onClick={() => setShowModal(true)}
          style={{ flex: 1 }}
          title="Adicionar à Playlist"
        >
          <IconFolder size={16} /> Playlist
        </button>
      </div>

      {showModal && (
        <AddToPlaylistModal 
          ebookId={ebookId} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  )
}
