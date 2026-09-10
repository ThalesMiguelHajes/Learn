'use client'

import Link from 'next/link'
import Image from 'next/image'
import { IconBookOpen } from '@/components/icons'

export default function EbookCard({ ebook, index, isMaterial = false }) {
  const href = isMaterial ? `/biblioteca/material/${ebook.id}` : `/biblioteca/livro/${ebook.id}`
  const format = ebook.file_type || ebook.material_type

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
          {format && (
            <span className="badge badge-info">{format.toUpperCase()}</span>
          )}
          <span className="text-secondary" style={{ fontSize: '0.8rem', marginLeft: 'auto' }}>
            Detalhes &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}
