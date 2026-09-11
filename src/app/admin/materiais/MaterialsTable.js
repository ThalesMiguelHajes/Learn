'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconEdit, IconTrash, IconBookOpen } from '@/components/icons'

export default function MaterialsTable({ materials }) {
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)

    const material = materials.find(e => e.id === deleteId)

    if (material?.file_path) {
      await supabase.storage.from('materials').remove([material.file_path])
    }
    if (material?.cover_url) {
      try {
        const url = new URL(material.cover_url)
        const path = url.pathname.split('/covers/')[1]
        if (path) await supabase.storage.from('covers').remove([decodeURIComponent(path)])
      } catch {}
    }

    await supabase.from('materials').delete().eq('id', deleteId)

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
            {materials.map((material) => (
              <tr key={material.id}>
                <td>
                  {material.cover_url ? (
                    <Image src={material.cover_url} alt="" width={48} height={64} className="table-thumbnail" />
                  ) : (
                    <div className="table-thumbnail flex items-center justify-center">
                      <IconBookOpen size={18} />
                    </div>
                  )}
                </td>
                <td>
                  <div className="font-semibold">{material.title}</div>
                  <div className="text-tertiary" style={{ fontSize: '0.8125rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {material.description}
                  </div>
                </td>
                <td>
                  <span className="badge badge-accent">R$ {Number(material.price).toFixed(2)}</span>
                </td>
                <td>
                  <span className="badge badge-info">
                    {material.material_type === 'html_slides' ? 'SLIDES' : (material.material_type?.toUpperCase() || '—')}
                  </span>
                </td>
                <td>
                  <span className={`badge ${material.is_active ? 'badge-success' : 'badge-error'}`}>
                    {material.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="text-secondary" style={{ whiteSpace: 'nowrap' }}>
                  {new Date(material.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td>
                  <div className="table-actions">
                    <Link href={`/admin/materiais/${material.id}/editar`} className="btn btn-ghost btn-sm" title="Editar">
                      <IconEdit size={16} />
                    </Link>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(material.id)} title="Excluir">
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
                Tem certeza que deseja excluir este material? Esta ação não pode ser desfeita.
                Todas as atribuições deste material também serão removidas.
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
