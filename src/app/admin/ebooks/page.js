'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function EbooksListPage() {
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchEbooks()
  }, [])

  async function fetchEbooks() {
    setLoading(true)
    const { data, error } = await supabase
      .from('ebooks')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setEbooks(data || [])
    setLoading(false)
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)

    const ebook = ebooks.find(e => e.id === deleteId)

    // Delete files from storage
    if (ebook?.file_path) {
      await supabase.storage.from('ebooks').remove([ebook.file_path])
    }
    if (ebook?.cover_url) {
      try {
        const url = new URL(ebook.cover_url)
        const path = url.pathname.split('/covers/')[1]
        if (path) await supabase.storage.from('covers').remove([decodeURIComponent(path)])
      } catch {}
    }

    // Delete from database
    await supabase.from('ebooks').delete().eq('id', deleteId)

    setDeleteId(null)
    setDeleting(false)
    fetchEbooks()
  }

  const filtered = ebooks.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>E-books</h1>
          <p>Gerencie seus livros digitais</p>
        </div>
        <Link href="/admin/ebooks/novo" className="btn btn-primary">
          ＋ Novo E-book
        </Link>
      </div>

      <div className="search-bar mb-lg">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="form-input"
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '2.75rem' }}
          id="search-ebooks"
        />
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner spinner-lg" />
          <p>Carregando e-books...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>{search ? 'Nenhum resultado encontrado' : 'Nenhum e-book cadastrado'}</h3>
          <p>{search ? 'Tente outro termo de busca.' : 'Comece adicionando seu primeiro e-book.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Capa</th>
                <th>Título</th>
                <th>Preço</th>
                <th>Formato</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ebook) => (
                <tr key={ebook.id}>
                  <td>
                    {ebook.cover_url ? (
                      <img src={ebook.cover_url} alt="" className="table-thumbnail" />
                    ) : (
                      <div className="table-thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📖</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ebook.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ebook.description}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-accent">R$ {Number(ebook.price).toFixed(2)}</span>
                  </td>
                  <td>
                    <span className="badge badge-info">{ebook.file_type?.toUpperCase() || '—'}</span>
                  </td>
                  <td>
                    <span className={`badge ${ebook.is_active ? 'badge-success' : 'badge-error'}`}>
                      {ebook.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(ebook.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link
                        href={`/admin/ebooks/${ebook.id}/editar`}
                        className="btn btn-ghost btn-sm"
                        title="Editar"
                      >
                        ✏️
                      </Link>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setDeleteId(ebook.id)}
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar exclusão</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(null)} disabled={deleting}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Tem certeza que deseja excluir este e-book? Esta ação não pode ser desfeita.
                Todas as atribuições deste e-book também serão removidas.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)} disabled={deleting}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <><span className="spinner" /> Excluindo...</> : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
