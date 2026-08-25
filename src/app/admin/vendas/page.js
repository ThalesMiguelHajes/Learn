import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import VendasClient from './VendasClient'

export const metadata = {
  title: 'Vendas — Painel Admin',
}

export default async function VendasPage() {
  await requireAdmin()
  const supabase = await createClient()

  // 1. Buscar todas as vendas com detalhes do cliente
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select(`
      *,
      profiles!sales_user_id_fkey(full_name, email),
      sale_items(ebook_id)
    `)
    .order('created_at', { ascending: false })

  // 2. Calcular Faturamento Total
  const totalRevenue = (sales || []).reduce((acc, sale) => acc + Number(sale.total_amount), 0)

  // 3. Buscar usuários para o formulário de Nova Venda
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .order('full_name')

  // 4. Buscar e-books para o formulário de Nova Venda
  const { data: ebooks } = await supabase
    .from('ebooks')
    .select('id, title, is_active')
    .eq('is_active', true)
    .order('title')

  return (
    <div className="admin-vendas-page">
      {salesError && (
        <div className="toast-error" style={{ marginBottom: 'var(--space-md)' }}>
          Erro ao carregar os dados de vendas.
        </div>
      )}
      <VendasClient 
        sales={sales || []} 
        totalRevenue={totalRevenue} 
        users={users || []} 
        ebooks={ebooks || []} 
      />
    </div>
  )
}
