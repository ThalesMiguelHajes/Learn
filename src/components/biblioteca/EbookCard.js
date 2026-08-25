'use client'

import Link from 'next/link'

export default function EbookCard({ ebook, index }) {
  return (
    <Link 
      href={`/biblioteca/livro/${ebook.id}`}
      className="glass-card ebook-card animate-in"
      style={{ animationDelay: `${index * 80}ms`, textDecoration: 'none', display: 'block', cursor: 'pointer' }}
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
        <div className="ebook-card-footer">
          {ebook.file_type && (
            <span className="badge badge-info">{ebook.file_type.toUpperCase()}</span>
          )}
          <span className="text-secondary" style={{ fontSize: '0.8rem', marginLeft: 'auto' }}>
            Detalhes &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}
