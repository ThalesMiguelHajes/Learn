'use client'

import { useState, useEffect, use, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'
import { IconArrowLeft, IconPlus, IconTrash, IconBookOpen, IconBooks, IconSearch } from '@/components/icons'

export default function GerenciarProdutosUsuario({ params }) {
  const { id: userId } = use(params)
  const [user, setUser] = useState(null)
  
  const [assignedItems, setAssignedItems] = useState([])
  const [allItems, setAllItems] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [removing, setRemoving] = useState(null)
  
  const [selectedItems, setSelectedItems] = useState([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [itemSearch, setItemSearch] = useState('')
  
  const supabase = createClient()
  const router = useRouter()

  async function fetchData() {
    setLoading(true)

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    setUser(profile)

    // Buscar atribuições (E-books, Materiais, Cursos)
    const [
      { data: assignedEbooks },
      { data: assignedMaterials },
      { data: assignedCourses }
    ] = await Promise.all([
      supabase.from('user_ebooks').select('*, ebooks(*)').eq('user_id', userId),
      supabase.from('user_materials').select('*, materials(*)').eq('user_id', userId),
      supabase.from('user_courses').select('*, courses(*)').eq('user_id', userId)
    ])

    const combinedAssignments = [
      ...(assignedEbooks || []).filter(a => a.ebooks).map(a => ({ ...a, type: 'ebook', product: a.ebooks })),
      ...(assignedMaterials || []).filter(a => a.materials).map(a => ({ ...a, type: 'material', product: a.materials })),
      ...(assignedCourses || []).filter(a => a.courses).map(a => ({ ...a, type: 'course', product: a.courses }))
    ].sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at))

    setAssignedItems(combinedAssignments)

    // Buscar todos os produtos disponíveis
    const [
      { data: ebooks },
      { data: materials },
      { data: courses }
    ] = await Promise.all([
      supabase.from('ebooks').select('id, title, cover_url, price').eq('is_active', true).order('title'),
      supabase.from('materials').select('id, title, cover_url, price').eq('is_active', true).order('title'),
      supabase.from('courses').select('id, title, cover_url, price').eq('is_active', true).order('title')
    ])

    const combinedItems = [
      ...(ebooks || []).map(e => ({ ...e, type: 'ebook' })),
      ...(materials || []).map(m => ({ ...m, type: 'material' })),
      ...(courses || []).map(c => ({ ...c, type: 'course' }))
    ]

    setAllItems(combinedItems)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [userId])

  const assignedKeys = assignedItems.map(a => `${a.type}-${a.product.id}`)
  const availableItems = allItems.filter(i => !assignedKeys.includes(`${i.type}-${i.id}`))
  
  const filteredAvailableItems = itemSearch.trim()
    ? availableItems.filter(i => i.title.toLowerCase().includes(itemSearch.trim().toLowerCase()))
    : availableItems

  function toggleItemSelection(item) {
    const key = `${item.type}-${item.id}`
    setSelectedItems(prev => {
      const exists = prev.some(p => `${p.type}-${p.id}` === key)
      if (exists) {
        return prev.filter(p => `${p.type}-${p.id}` !== key)
      } else {
        return [...prev, item]
      }
    })
  }

  function isSelected(item) {
    return selectedItems.some(p => `${p.type}-${p.id}` === `${item.type}-${item.id}`)
  }

  async function handleAssign() {
    if (selectedItems.length === 0) return
    setAssigning(true)

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      for (const item of selectedItems) {
        let tableName = ''
        let idCol = ''
        if (item.type === 'ebook') { tableName = 'user_ebooks'; idCol = 'ebook_id' }
        if (item.type === 'material') { tableName = 'user_materials'; idCol = 'material_id' }
        if (item.type === 'course') { tableName = 'user_courses'; idCol = 'course_id' }

        if (tableName) {
          await supabase.from(tableName).insert([{
            user_id: userId,
            [idCol]: item.id,
            assigned_by: currentUser?.id,
          }])
        }
      }

      setSelectedItems([])
      setItemSearch('')
      setShowAssignModal(false)
      await fetchData()
    } catch (err) {
      console.error('Erro ao atribuir:', err)
    } finally {
      setAssigning(false)
    }
  }

  async function handleRemove(assignment) {
    const key = `${assignment.type}-${assignment.product.id}`
    setRemoving(key)

    try {
      let tableName = ''
      let idCol = ''
      if (assignment.type === 'ebook') { tableName = 'user_ebooks'; idCol = 'ebook_id' }
      if (assignment.type === 'material') { tableName = 'user_materials'; idCol = 'material_id' }
      if (assignment.type === 'course') { tableName = 'user_courses'; idCol = 'course_id' }

      if (tableName) {
        await supabase
          .from(tableName)
          .delete()
          .eq('user_id', userId)
          .eq(idCol, assignment.product.id)
      }

      await fetchData()
    } catch (err) {
      console.error('Erro ao remover:', err)
    } finally {
      setRemoving(null)
    }
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg" />
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Gerenciar Acessos</h1>
          <p>Atribuir ou remover produtos do cliente</p>
        </div>
        <button className="btn btn-secondary" onClick={() => router.push('/admin/usuarios')}>
          <IconArrowLeft size={16} /> Voltar
        </button>
      </div>

      <div className="glass-card panel mb-xl">
        <div className="flex items-center gap-lg">
          <Avatar name={user?.full_name} size={56} />
          <div>
            <h3 style={{ marginBottom: '2px' }}>{user?.full_name || 'Sem nome'}</h3>
            <p className="text-secondary" style={{ fontSize: '0.9375rem' }}>{user?.email}</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className="badge badge-accent" style={{ fontSize: '0.875rem', padding: '0.375rem 0.875rem' }}>
              {assignedItems.length} produto{assignedItems.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-lg">
        <h3>Produtos Atribuídos</h3>
        <button
          className="btn btn-primary"
          onClick={() => setShowAssignModal(true)}
          disabled={availableItems.length === 0}
        >
          <IconPlus size={16} /> Atribuir Produto
        </button>
      </div>

      {assignedItems.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-icon"><IconBooks size={40} /></div>
            <h3>Nenhum produto atribuído</h3>
            <p>Clique em &ldquo;Atribuir Produto&rdquo; para dar acesso a um produto para este cliente.</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Capa</th>
                <th>Título</th>
                <th>Preço</th>
                <th>Atribuído em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {assignedItems.map((assignment) => {
                const key = `${assignment.type}-${assignment.product.id}`
                return (
                  <tr key={key}>
                    <td>
                      <span className="badge badge-info">{assignment.type.toUpperCase()}</span>
                    </td>
                    <td>
                      {assignment.product?.cover_url ? (
                        <Image src={assignment.product.cover_url} alt="" width={48} height={64} className="table-thumbnail" />
                      ) : (
                        <div className="table-thumbnail flex items-center justify-center">
                          <IconBookOpen size={18} />
                        </div>
                      )}
                    </td>
                    <td className="font-semibold">{assignment.product?.title || '—'}</td>
                    <td>
                      <span className="badge badge-accent">R$ {Number(assignment.product?.price || 0).toFixed(2)}</span>
                    </td>
                    <td className="text-secondary" style={{ whiteSpace: 'nowrap' }}>
                      {new Date(assignment.assigned_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemove(assignment)}
                        disabled={removing === key}
                      >
                        {removing === key ? <span className="spinner" /> : <><IconTrash size={14} /> Remover</>}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAssignModal && (
        <Modal
          title="Atribuir Produtos"
          onClose={() => { if (!assigning) { setShowAssignModal(false); setItemSearch('') } }}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => { setShowAssignModal(false); setItemSearch('') }} disabled={assigning}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAssign}
                disabled={assigning || selectedItems.length === 0}
              >
                {assigning ? (
                  <><span className="spinner" /> Atribuindo...</>
                ) : (
                  `Atribuir ${selectedItems.length} produto${selectedItems.length !== 1 ? 's' : ''}`
                )}
              </button>
            </>
          }
        >
          {availableItems.length === 0 ? (
            <p className="text-secondary">Todos os produtos já foram atribuídos a este cliente.</p>
          ) : (
            <>
              <p className="text-secondary mb-lg" style={{ fontSize: '0.875rem' }}>
                Selecione os produtos que deseja atribuir a <strong style={{ color: 'var(--text-primary)' }}>{user?.full_name}</strong>:
              </p>
              <div className="search-bar mb-sm">
                <span className="search-icon"><IconSearch size={16} /></span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Buscar produto..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                />
              </div>
              <div className="checkbox-list">
                {filteredAvailableItems.length === 0 ? (
                  <p className="text-tertiary" style={{ padding: 'var(--space-sm)', textAlign: 'center', fontSize: '0.875rem' }}>
                    Nenhum produto encontrado.
                  </p>
                ) : filteredAvailableItems.map((item) => (
                  <label key={`${item.type}-${item.id}`} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={isSelected(item)}
                      onChange={() => toggleItemSelection(item)}
                    />
                    <div className="flex items-center gap-md" style={{ flex: 1 }}>
                      {item.cover_url ? (
                        <Image src={item.cover_url} alt="" width={32} height={42} className="table-thumbnail-sm" />
                      ) : (
                        <div className="table-thumbnail-sm flex items-center justify-center">
                          <IconBookOpen size={16} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                          <span className="text-secondary" style={{ fontSize: '0.8rem', marginRight: '6px' }}>
                            [{item.type === 'ebook' ? 'E-book' : item.type === 'material' ? 'Material' : 'Curso'}]
                          </span>
                          {item.title}
                        </div>
                        <div className="text-tertiary" style={{ fontSize: '0.75rem' }}>R$ {Number(item.price).toFixed(2)}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  )
}
