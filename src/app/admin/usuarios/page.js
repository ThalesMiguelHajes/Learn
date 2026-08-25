'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchUsuarios()
  }, [])

  async function fetchUsuarios() {
    setLoading(true)

    // Fetch clients with their ebook count
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'cliente')
      .order('created_at', { ascending: false })

    if (error) {
      setLoading(false)
      return
    }

    // Get ebook counts for each user
    const usersWithCounts = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { count } = await supabase
          .from('user_ebooks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)

        return { ...profile, ebook_count: count || 0 }
      })
    )

    setUsuarios(usersWithCounts)
    setLoading(false)
  }

  const filtered = usuarios.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Usuários</h1>
          <p>Gerencie seus clientes e atribua e-books</p>
        </div>
      </div>

      <div className="search-bar mb-lg">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="form-input"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '2.75rem' }}
          id="search-users"
        />
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner spinner-lg" />
          <p>Carregando usuários...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>{search ? 'Nenhum resultado encontrado' : 'Nenhum cliente registrado'}</h3>
          <p>{search ? 'Tente outro termo de busca.' : 'Os clientes aparecerão aqui após se cadastrarem.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>E-mail</th>
                <th>E-books</th>
                <th>Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const initials = user.full_name
                  ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                  : '?'

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-md">
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--accent-gradient)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: '#fff',
                          flexShrink: 0,
                        }}>
                          {initials}
                        </div>
                        <span style={{ fontWeight: 600 }}>{user.full_name || 'Sem nome'}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td>
                      <span className="badge badge-accent">{user.ebook_count} e-book{user.ebook_count !== 1 ? 's' : ''}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <Link href={`/admin/usuarios/${user.id}`} className="btn btn-secondary btn-sm">
                        📚 Gerenciar E-books
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
