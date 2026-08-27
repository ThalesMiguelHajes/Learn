import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import VendasClient from './VendasClient'
import Pagination from '@/components/ui/Pagination'

const PAGE_SIZE = 25

export const metadata = {
  title: 'Vendas — Painel Admin',
}

export default async function VendasPage({ searchParams }) {
  await requireAdmin()
  const { page: pageParam } = await searchParams || {}
  const page = Math.max(1, parseInt(pageParam, 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()

  // 1. Buscar a página atual de vendas (sem join direto no profiles porque a FK aponta para auth.users)
  const { data: rawSales, count, error: salesError } = await supabase
    .from('sales')
    .select('*, sale_items(ebook_id)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (salesError) {
    console.error('Erro no Supabase:', salesError)
  }

  // 2. Buscar só os perfis desta página de vendas (não a tabela inteira)
  const userIds = [...new Set((rawSales || []).map(s => s.user_id))]
  const { data: profilesForPage } = userIds.length
    ? await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
    : { data: [] }

  const sales = (rawSales || []).map(sale => ({
    ...sale,
    profiles: (profilesForPage || []).find(p => p.id === sale.user_id) || null,
  }))

  // 3. Faturamento total (todas as vendas, não só a página atual) — só a coluna necessária
  const { data: allTotals } = await supabase.from('sales').select('total_amount')
  const totalRevenue = (allTotals || []).reduce((acc, s) => acc + Number(s.total_amount), 0)

  // 4. Usuários e e-books para o formulário de Nova Venda
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .order('full_name')

  const { data: ebooks } = await supabase
    .from('ebooks')
    .select('id, title, is_active')
    .eq('is_active', true)
    .order('title')

  return (
    <div className="admin-vendas-page">
      {salesError && (
        <div className="form-feedback form-feedback-error mb-md">
          Erro ao carregar os dados de vendas.
        </div>
      )}
      <VendasClient
        sales={sales}
        totalRevenue={totalRevenue}
        users={users || []}
        ebooks={ebooks || []}
      />
      <Pagination page={page} pageSize={PAGE_SIZE} total={count || 0} />
    </div>
  )
}
