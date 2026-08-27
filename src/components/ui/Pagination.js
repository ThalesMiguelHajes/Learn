import Link from 'next/link'

export default function Pagination({ page, pageSize, total, extraParams = {} }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null

  function hrefFor(p) {
    const clamped = Math.min(Math.max(1, p), totalPages)
    const params = new URLSearchParams(extraParams)
    params.set('page', String(clamped))
    return `?${params.toString()}`
  }

  return (
    <div className="pagination">
      <Link href={hrefFor(page - 1)} className="btn btn-secondary btn-sm" aria-disabled={page <= 1}>
        Anterior
      </Link>
      <span className="pagination-status">Página {page} de {totalPages}</span>
      <Link href={hrefFor(page + 1)} className="btn btn-secondary btn-sm" aria-disabled={page >= totalPages}>
        Próxima
      </Link>
    </div>
  )
}
