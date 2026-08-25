'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AtribuicoesPage() {
  const [atribuicoes, setAtribuicoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchAtribuicoes()
  }, [])

  async function fetchAtribuicoes() {
    setLoading(true)

    const { data, error } = await supabase
      .from('user_ebooks')
      .select(`
        *,
        profiles!user_ebooks_user_id_fkey(full_name, email),
        ebooks(title, cover_url, price),
        assigned_profile:profiles!user_ebooks_assigned_by_fkey(full_name)
      `)
      .order('assigned_at', { ascending: false })

    if (!error) setAtribuicoes(data || [])
    setLoading(false)
  }

  const filtered = atribuicoes.filter(a => {
    const term = search.toLowerCase()
    return (
      a.profiles?.full_name?.toLowerCase().includes(term) ||
      a.profiles?.email?.toLowerCase().includes(term) ||
      a.ebooks?.title?.toLowerCase().includes(term)
    )
  })

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Atribuições</h1>
          <p>Visão geral de todas as atribuições de e-books</p>
        </div>
      </div>

      <div className="search-bar mb-lg">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="form-input"
          placeholder="Buscar por cliente ou e-book..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '2.75rem' }}
          id="search-atribuicoes"
        />
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner spinner-lg" />
          <p>Carregando atribuições...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔗</div>
          <h3>{search ? 'Nenhum resultado encontrado' : 'Nenhuma atribuição realizada'}</h3>
          <p>{search ? 'Tente outro termo.' : 'Atribua e-books aos clientes na página de Usuários.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>E-book</th>
                <th>Atribuído por</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.profiles?.full_name || '—'}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{a.profiles?.email}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-md">
                      {a.ebooks?.cover_url ? (
                        <img src={a.ebooks.cover_url} alt="" style={{ width: '32px', height: '42px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ width: '32px', height: '42px', background: 'var(--bg-tertiary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>📖</div>
                      )}
                      <span style={{ fontWeight: 500 }}>{a.ebooks?.title || '—'}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {a.assigned_profile?.full_name || 'Sistema'}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(a.assigned_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
