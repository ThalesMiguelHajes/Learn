import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import Pagination from '@/components/ui/Pagination'
import Image from 'next/image'
import { IconBookOpen, IconLink } from '@/components/icons'

const PAGE_SIZE = 25

export default async function AtribuicoesPage({ searchParams }) {
  await requireAdmin()
  const { page: pageParam } = await searchParams || {}
  const page = Math.max(1, parseInt(pageParam, 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  const { data: atribuicoes, count } = await supabase
    .from('user_ebooks')
    .select(`
      *,
      profiles!user_ebooks_user_id_fkey(full_name, email),
      ebooks(title, cover_url, price),
      assigned_profile:profiles!user_ebooks_assigned_by_fkey(full_name)
    `, { count: 'exact' })
    .order('assigned_at', { ascending: false })
    .range(from, to)

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Atribuições</h1>
          <p>Visão geral de todas as atribuições de e-books</p>
        </div>
      </div>

      {!atribuicoes || atribuicoes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><IconLink size={40} /></div>
          <h3>Nenhuma atribuição realizada</h3>
          <p>Atribua e-books aos clientes na página de Usuários.</p>
        </div>
      ) : (
        <>
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
                {atribuicoes.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="font-semibold">{a.profiles?.full_name || '—'}</div>
                      <div className="text-tertiary" style={{ fontSize: '0.8125rem' }}>{a.profiles?.email}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-md">
                        {a.ebooks?.cover_url ? (
                          <Image src={a.ebooks.cover_url} alt="" width={32} height={42} className="table-thumbnail-sm" />
                        ) : (
                          <div className="table-thumbnail-sm flex items-center justify-center">
                            <IconBookOpen size={16} />
                          </div>
                        )}
                        <span style={{ fontWeight: 500 }}>{a.ebooks?.title || '—'}</span>
                      </div>
                    </td>
                    <td className="text-secondary">
                      {a.assigned_profile?.full_name || 'Sistema'}
                    </td>
                    <td className="text-secondary" style={{ whiteSpace: 'nowrap' }}>
                      {new Date(a.assigned_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={count || 0} />
        </>
      )}
    </>
  )
}
