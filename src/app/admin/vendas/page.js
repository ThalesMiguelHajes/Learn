import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import VendasClient from './VendasClient'

export const metadata = {
  title: 'Vendas — Painel Admin',
}

export default async function VendasPage() {
  await requireAdmin()
  const supabase = await createClient()

  // 1. Buscar todas as vendas (sem join direto no profiles porque a FK aponta para auth.users)
  const { data: rawSales, error: salesError } = await supabase
    .from('sales')
    .select(`
      *,
      sale_items(ebook_id)
    `)
    .order('created_at', { ascending: false })

  if (salesError) {
    console.error("Erro no Supabase:", salesError)
  }

  // 2. Buscar usuários para o formulário e para mapear nas vendas
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .order('full_name')

  // 3. Mapear o 'profiles' para dentro de cada venda manualmente
  const sales = (rawSales || []).map(sale => {
    const userProfile = (users || []).find(u => u.id === sale.user_id)
    return {
      ...sale,
      profiles: userProfile || null
    }
  })

  // 4. Calcular Faturamento Total
  const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.total_amount), 0)

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
