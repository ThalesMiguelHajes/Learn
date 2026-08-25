'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

  useEffect(() => {
    fetchData()
  }, [userId])

  async function fetchData() {
    setLoading(true)

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    setUser(profile)

    // Fetch assigned ebooks
    const { data: assignments } = await supabase
      .from('user_ebooks')
      .select('*, ebooks(*)')
      .eq('user_id', userId)
      .order('assigned_at', { ascending: false })

    setAssignedEbooks(assignments || [])

    // Fetch all ebooks for assignment modal
    const { data: ebooks } = await supabase
      .from('ebooks')
      .select('id, title, cover_url, price')
      .eq('is_active', true)
      .order('title')

    setAllEbooks(ebooks || [])
    setLoading(false)
  }

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

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?'

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Gerenciar E-books</h1>
          <p>Atribuir ou remover e-books do cliente</p>
        </div>
        <button className="btn btn-secondary" onClick={() => router.push('/admin/usuarios')}>
          ← Voltar
        </button>
      </div>

      {/* User info card */}
      <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
        <div className="flex items-center gap-lg">
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.125rem',
            color: '#fff',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <h3 style={{ marginBottom: '2px' }}>{user?.full_name || 'Sem nome'}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{user?.email}</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className="badge badge-accent" style={{ fontSize: '0.875rem', padding: '0.375rem 0.875rem' }}>
              {assignedEbooks.length} e-book{assignedEbooks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Assigned ebooks */}
      <div className="flex items-center justify-between mb-lg">
        <h3>E-books Atribuídos</h3>
        <button
          className="btn btn-primary"
          onClick={() => setShowAssignModal(true)}
          disabled={availableEbooks.length === 0}
        >
          ＋ Atribuir E-book
        </button>
      </div>

      {assignedEbooks.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>Nenhum e-book atribuído</h3>
            <p>Clique em "Atribuir E-book" para dar acesso a um e-book para este cliente.</p>
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
                      <div className="table-thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📖</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{assignment.ebooks?.title || '—'}</td>
                  <td>
                    <span className="badge badge-accent">R$ {Number(assignment.ebooks?.price || 0).toFixed(2)}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(assignment.assigned_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemove(assignment.ebook_id)}
                      disabled={removing === assignment.ebook_id}
                    >
                      {removing === assignment.ebook_id ? <span className="spinner" /> : '🗑️ Remover'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => !assigning && setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Atribuir E-books</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAssignModal(false)} disabled={assigning}>✕</button>
            </div>
            <div className="modal-body">
              {availableEbooks.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>Todos os e-books já foram atribuídos a este cliente.</p>
              ) : (
                <>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', fontSize: '0.875rem' }}>
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
                            <img src={ebook.cover_url} alt="" style={{ width: '32px', height: '42px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : (
                            <div style={{ width: '32px', height: '42px', background: 'var(--bg-tertiary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>📖</div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{ebook.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>R$ {Number(ebook.price).toFixed(2)}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
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
            </div>
          </div>
        </div>
      )}
    </>
  )
}
