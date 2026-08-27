import { createClient } from '@/lib/supabase/server'
import { IconWallet, IconBooks, IconUsers, IconBookOpen } from '@/components/icons'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch stats
  const [ebooksRes, clientesRes, atribuicoesRes, salesRes, recentEbooksRes] = await Promise.all([
    supabase.from('ebooks').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'cliente'),
    supabase.from('user_ebooks').select('*', { count: 'exact', head: true }),
    supabase.from('sales').select('total_amount'),
    supabase.from('ebooks').select('id, title, cover_url, price, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const totalEbooks = ebooksRes.count || 0
  const totalClientes = clientesRes.count || 0
  const totalAtribuicoes = atribuicoesRes.count || 0
  
  const salesData = salesRes.data || []
  const totalVendas = salesData.length
  const totalRevenue = salesData.reduce((acc, sale) => acc + Number(sale.total_amount), 0)
  
  const recentEbooks = recentEbooksRes.data || []

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Visão geral da sua plataforma</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card stat-card-highlight">
          <div className="stat-icon"><IconWallet size={22} /></div>
          <div className="stat-value stat-value-accent">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalRevenue)}
          </div>
          <div className="stat-label flex justify-between items-center">
            <span>Faturamento</span>
            <span className="badge badge-accent">{totalVendas} venda{totalVendas !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon"><IconBooks size={22} /></div>
          <div className="stat-value">{totalEbooks}</div>
          <div className="stat-label">E-books cadastrados</div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon"><IconUsers size={22} /></div>
          <div className="stat-value">{totalClientes}</div>
          <div className="stat-label">Clientes registrados</div>
        </div>
      </div>

      <div className="glass-card panel">
        <h3 className="mb-lg">E-books Recentes</h3>
        {recentEbooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><IconBooks size={40} /></div>
            <h3>Nenhum e-book cadastrado</h3>
            <p>Comece adicionando seu primeiro e-book.</p>
          </div>
        ) : (
          <div className="table-container table-container-flat">
            <table className="table">
              <thead>
                <tr>
                  <th>Capa</th>
                  <th>Título</th>
                  <th>Preço</th>
                  <th>Criado em</th>
                </tr>
              </thead>
              <tbody>
                {recentEbooks.map((ebook) => (
                  <tr key={ebook.id}>
                    <td>
                      {ebook.cover_url ? (
                        <img src={ebook.cover_url} alt="" className="table-thumbnail" />
                      ) : (
                        <div className="table-thumbnail flex items-center justify-center">
                          <IconBookOpen size={20} />
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{ebook.title}</td>
                    <td>
                      <span className="badge badge-accent">
                        R$ {Number(ebook.price).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(ebook.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
