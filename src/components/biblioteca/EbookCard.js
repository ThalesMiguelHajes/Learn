'use client'

import Image from 'next/image'
import Link from 'next/link'
import { IconBookOpen } from '@/components/icons'

export default function EbookCard({ ebook, index = 0, isMaterial = false, isCourse = false }) {
  // If it doesn't have an id, we can't link to it.
  if (!ebook?.id) return null

  let href = `/biblioteca/livro/${ebook.id}`
  let typeLabel = ebook.file_type || 'E-book'
  
  if (isMaterial) {
    href = `/biblioteca/material/${ebook.id}`
    typeLabel = ebook.material_type || 'Material'
  } else if (isCourse) {
    href = `/biblioteca/cursos/${ebook.id}`
    typeLabel = 'Curso'
  }

  return (
    <Link
      href={href}
      className="glass-card ebook-card animate-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
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
          <IconBookOpen size={40} />
        </div>
      )}
      <div className="ebook-card-body">
        <h3 className="ebook-card-title">{ebook.title}</h3>
        {ebook.description && (
          <p className="ebook-card-desc">{ebook.description}</p>
        )}
        <div className="ebook-card-footer">
          {typeLabel && (
            <span className="badge badge-info">{typeLabel.toUpperCase()}</span>
          )}
          <span className="text-secondary" style={{ fontSize: '0.8rem', marginLeft: 'auto' }}>
            Detalhes &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}
