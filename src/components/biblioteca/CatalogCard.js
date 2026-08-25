'use client'

export default function CatalogCard({ ebook, index }) {
  const whatsappNumber = '5516996004393'
  const message = `Olá! Queria adquirir o E-book: ${ebook.title}`
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

  // Format price
  const priceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(ebook.price || 0)

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
        <div className="ebook-card-footer">
          <span className="ebook-card-price">{priceFormatted}</span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            🛒 Comprar
          </a>
        </div>
      </div>
    </div>
  )
}
