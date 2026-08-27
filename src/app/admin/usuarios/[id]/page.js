'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'
import { IconArrowLeft, IconPlus, IconTrash, IconBookOpen, IconBooks } from '@/components/icons'

export default function GerenciarEbooksUsuario({ params }) {
  const { id: userId } = use(params)
  const [user, setUser] = useState(null)
  const [assignedEbooks, setAssignedEbooks] = useState([])
  const [allEbooks, setAllEbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [selectedEbooks, setSelectedEbooks] = useState([])
  const [showAssignModal, setShowAssignModal] = useState(false)
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

    const { data: assignments } = await supabase
      .from('user_ebooks')
      .select('*, ebooks(*)')
      .eq('user_id', userId)
      .order('assigned_at', { ascending: false })

    setAssignedEbooks(assignments || [])

    const { data: ebooks } = await supabase
      .from('ebooks')
      .select('id, title, cover_url, price')
      .eq('is_active', true)
      .order('title')

    setAllEbooks(ebooks || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [userId])

  const assignedIds = assignedEbooks.map(a => a.ebook_id)
  const availableEbooks = allEbooks.filter(e => !assignedIds.includes(e.id))

  function toggleEbookSelection(ebookId) {
    setSelectedEbooks(prev =>
      prev.includes(ebookId)
        ? prev.filter(id => id !== ebookId)
        : [...prev, ebookId]
    )
  }

  async function handleAssign() {
    if (selectedEbooks.length === 0) return
    setAssigning(true)

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      const inserts = selectedEbooks.map(ebookId => ({
        user_id: userId,
        ebook_id: ebookId,
        assigned_by: currentUser?.id,
      }))

      const { error } = await supabase.from('user_ebooks').insert(inserts)
      if (error) throw error

      setSelectedEbooks([])
      setShowAssignModal(false)
      await fetchData()
    } catch (err) {
      console.error('Erro ao atribuir:', err)
    } finally {
      setAssigning(false)
    }
  }

  async function handleRemove(ebookId) {
    setRemoving(ebookId)

    try {
      await supabase
        .from('user_ebooks')
        .delete()
        .eq('user_id', userId)
        .eq('ebook_id', ebookId)

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
          <h1>Gerenciar E-books</h1>
          <p>Atribuir ou remover e-books do cliente</p>
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
              {assignedEbooks.length} e-book{assignedEbooks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-lg">
        <h3>E-books Atribuídos</h3>
        <button
          className="btn btn-primary"
          onClick={() => setShowAssignModal(true)}
          disabled={availableEbooks.length === 0}
        >
          <IconPlus size={16} /> Atribuir E-book
        </button>
      </div>

      {assignedEbooks.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-icon"><IconBooks size={40} /></div>
            <h3>Nenhum e-book atribuído</h3>
            <p>Clique em &ldquo;Atribuir E-book&rdquo; para dar acesso a um e-book para este cliente.</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Capa</th>
                <th>Título</th>
                <th>Preço</th>
                <th>Atribuído em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {assignedEbooks.map((assignment) => (
                <tr key={assignment.id}>
                  <td>
                    {assignment.ebooks?.cover_url ? (
                      <img src={assignment.ebooks.cover_url} alt="" className="table-thumbnail" />
                    ) : (
                      <div className="table-thumbnail flex items-center justify-center">
                        <IconBookOpen size={18} />
                      </div>
                    )}
                  </td>
                  <td className="font-semibold">{assignment.ebooks?.title || '—'}</td>
                  <td>
                    <span className="badge badge-accent">R$ {Number(assignment.ebooks?.price || 0).toFixed(2)}</span>
                  </td>
                  <td className="text-secondary" style={{ whiteSpace: 'nowrap' }}>
                    {new Date(assignment.assigned_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemove(assignment.ebook_id)}
                      disabled={removing === assignment.ebook_id}
                    >
                      {removing === assignment.ebook_id ? <span className="spinner" /> : <><IconTrash size={14} /> Remover</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAssignModal && (
        <Modal
          title="Atribuir E-books"
          onClose={() => !assigning && setShowAssignModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)} disabled={assigning}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAssign}
                disabled={assigning || selectedEbooks.length === 0}
              >
                {assigning ? (
                  <><span className="spinner" /> Atribuindo...</>
                ) : (
                  `Atribuir ${selectedEbooks.length} e-book${selectedEbooks.length !== 1 ? 's' : ''}`
                )}
              </button>
            </>
          }
        >
          {availableEbooks.length === 0 ? (
            <p className="text-secondary">Todos os e-books já foram atribuídos a este cliente.</p>
          ) : (
            <>
              <p className="text-secondary mb-lg" style={{ fontSize: '0.875rem' }}>
                Selecione os e-books que deseja atribuir a <strong style={{ color: 'var(--text-primary)' }}>{user?.full_name}</strong>:
              </p>
              <div className="checkbox-list">
                {availableEbooks.map((ebook) => (
                  <label key={ebook.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedEbooks.includes(ebook.id)}
                      onChange={() => toggleEbookSelection(ebook.id)}
                    />
                    <div className="flex items-center gap-md" style={{ flex: 1 }}>
                      {ebook.cover_url ? (
                        <img src={ebook.cover_url} alt="" className="table-thumbnail-sm" />
                      ) : (
                        <div className="table-thumbnail-sm flex items-center justify-center">
                          <IconBookOpen size={16} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{ebook.title}</div>
                        <div className="text-tertiary" style={{ fontSize: '0.75rem' }}>R$ {Number(ebook.price).toFixed(2)}</div>
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
