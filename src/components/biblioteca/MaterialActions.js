'use client'

import { useState } from 'react'
import Link from 'next/link'
import AddToPlaylistModal from './AddToPlaylistModal'
import { IconBookOpen, IconDownload, IconFolder } from '@/components/icons'

export default function MaterialActions({ materialId, fileType }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="ebook-actions flex gap-sm mt-lg">
        {fileType === 'pdf' && (
          <Link
            href={`/biblioteca/ler/${materialId}`}
            className="btn btn-primary justify-center"
            style={{ flex: 1 }}
          >
            <IconBookOpen size={16} /> Ler Agora
          </Link>
        )}
        {/* Deixa o navegador baixar diretamente via Content-Disposition da rota,
            em vez de carregar o arquivo inteiro em memória com fetch + blob. */}
        <a
          href={`/api/download/${materialId}?type=material`}
          className="btn btn-secondary justify-center"
          style={{ flex: 1 }}
        >
          <IconDownload size={16} /> Download
        </a>
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
          materialId={materialId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
