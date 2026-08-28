import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import SearchBar from '@/components/biblioteca/SearchBar'
import Pagination from '@/components/ui/Pagination'
import Avatar from '@/components/ui/Avatar'
import { IconUsers } from '@/components/icons'

const PAGE_SIZE = 20

export default async function UsuariosPage({ searchParams }) {
  await requireAdmin()
  const { q, page: pageParam } = await searchParams || {}
  const page = Math.max(1, parseInt(pageParam, 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  // profiles recebe duas FKs de user_ebooks (user_id e assigned_by), então o nome da
  // constraint precisa ser explícito — sem isso o PostgREST recusa o embed por ambiguidade.
  let query = supabase
    .from('profiles')
    .select('*, user_ebooks!user_ebooks_user_id_fkey(count)', { count: 'exact' })
    .eq('role', 'cliente')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data: usuarios, count, error } = await query.range(from, to)

  if (error) {
    console.error('Erro ao buscar usuários:', error)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Usuários</h1>
          <p>Gerencie seus clientes e atribua e-books</p>
        </div>
      </div>

      <Suspense fallback={<div className="search-bar mb-lg" />}>
        <SearchBar placeholder="Buscar por nome ou e-mail..." />
      </Suspense>

      {error && (
        <div className="form-feedback form-feedback-error mb-lg">
          Erro ao carregar usuários. Tente recarregar a página.
        </div>
      )}

      {!usuarios || usuarios.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><IconUsers size={40} /></div>
          <h3>{q ? 'Nenhum resultado encontrado' : 'Nenhum cliente registrado'}</h3>
          <p>{q ? 'Tente outro termo de busca.' : 'Os clientes aparecerão aqui após se cadastrarem.'}</p>
        </div>
      ) : (
        <>
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
                {usuarios.map((user) => {
                  const ebookCount = user.user_ebooks?.[0]?.count || 0
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-md">
                          <Avatar name={user.full_name} size={36} />
                          <span className="font-semibold">{user.full_name || 'Sem nome'}</span>
                        </div>
                      </td>
                      <td className="text-secondary">{user.email}</td>
                      <td>
                        <span className="badge badge-accent">{ebookCount} e-book{ebookCount !== 1 ? 's' : ''}</span>
                      </td>
                      <td className="text-secondary" style={{ whiteSpace: 'nowrap' }}>
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td>
                        <Link href={`/admin/usuarios/${user.id}`} className="btn btn-secondary btn-sm">
                          Gerenciar E-books
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={count || 0} extraParams={q ? { q } : {}} />
        </>
      )}
    </>
  )
}
