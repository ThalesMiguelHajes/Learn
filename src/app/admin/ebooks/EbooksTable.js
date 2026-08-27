'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconEdit, IconTrash, IconBookOpen } from '@/components/icons'

export default function EbooksTable({ ebooks }) {
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)

    const ebook = ebooks.find(e => e.id === deleteId)

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

    await supabase.from('ebooks').delete().eq('id', deleteId)

    setDeleteId(null)
    setDeleting(false)
    router.refresh()
  }

  return (
    <>
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
            {ebooks.map((ebook) => (
              <tr key={ebook.id}>
                <td>
                  {ebook.cover_url ? (
                    <Image src={ebook.cover_url} alt="" width={48} height={64} className="table-thumbnail" />
                  ) : (
                    <div className="table-thumbnail flex items-center justify-center">
                      <IconBookOpen size={18} />
                    </div>
                  )}
                </td>
                <td>
                  <div className="font-semibold">{ebook.title}</div>
                  <div className="text-tertiary" style={{ fontSize: '0.8125rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                <td className="text-secondary" style={{ whiteSpace: 'nowrap' }}>
                  {new Date(ebook.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td>
                  <div className="table-actions">
                    <Link href={`/admin/ebooks/${ebook.id}/editar`} className="btn btn-ghost btn-sm" title="Editar">
                      <IconEdit size={16} />
                    </Link>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(ebook.id)} title="Excluir">
                      <IconTrash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteId && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar exclusão</h3>
            </div>
            <div className="modal-body">
              <p className="text-secondary">
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
