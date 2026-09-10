import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import Pagination from '@/components/ui/Pagination'
import Image from 'next/image'
import Link from 'next/link'
import { IconBookOpen, IconLink } from '@/components/icons'

const PAGE_SIZE = 25

export default async function AtribuicoesPage({ searchParams }) {
  await requireAdmin()
  const resolvedSearchParams = await searchParams
  const pageParam = resolvedSearchParams?.page; const tab = resolvedSearchParams?.tab || 'ebooks';
  const page = Math.max(1, parseInt(pageParam, 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()

  let tableName = 'user_ebooks'
  let itemRelation = 'ebooks(title, cover_url, price)'
  let itemAlias = 'ebooks'
  let itemName = 'E-book'
  
  if (tab === 'materiais') {
    tableName = 'user_materials'
    itemRelation = 'materials(title, cover_url, price)'
    itemAlias = 'materials'
    itemName = 'Material'
  } else if (tab === 'cursos') {
    tableName = 'user_courses'
    itemRelation = 'courses(title, cover_url, price)'
    itemAlias = 'courses'
    itemName = 'Curso'
  }

  const { data: atribuicoes, count } = await supabase
    .from(tableName)
    .select(`
      *,
      profiles!${tableName}_user_id_fkey(full_name, email),
      ${itemRelation},
      assigned_profile:profiles!${tableName}_assigned_by_fkey(full_name)
    `, { count: 'exact' })
    .order('assigned_at', { ascending: false })
    .range(from, to)

  return (
    <>
      <div className="page-header mb-md">
        <div className="page-header-left">
          <h1>Atribuições</h1>
          <p>Visão geral de todas as atribuições de produtos na plataforma</p>
        </div>
      </div>

      <div className="tab-bar mb-xl">
        <Link
          href="/admin/atribuicoes?tab=ebooks"
          className={`btn ${tab === 'ebooks' ? 'btn-primary' : 'btn-secondary'}`}
        >
          E-books
        </Link>
        <Link
          href="/admin/atribuicoes?tab=materiais"
          className={`btn ${tab === 'materiais' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Materiais
        </Link>
        <Link
          href="/admin/atribuicoes?tab=cursos"
          className={`btn ${tab === 'cursos' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Cursos
        </Link>
      </div>

      {!atribuicoes || atribuicoes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><IconLink size={40} /></div>
          <h3>Nenhuma atribuição de {itemName.toLowerCase()}</h3>
          <p>Você pode atribuir itens aos clientes na página de Usuários.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>{itemName}</th>
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
                        {a[itemAlias]?.cover_url ? (
                          <Image src={a[itemAlias].cover_url} alt="" width={32} height={42} className="table-thumbnail-sm" />
                        ) : (
                          <div className="table-thumbnail-sm flex items-center justify-center">
                            <IconBookOpen size={16} />
                          </div>
                        )}
                        <span style={{ fontWeight: 500 }}>{a[itemAlias]?.title || '—'}</span>
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
          <Pagination page={page} pageSize={PAGE_SIZE} total={count || 0} extraParams={{ tab }} />
        </>
      )}
    </>
  )
}
