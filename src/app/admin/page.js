import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch stats
  const [ebooksRes, clientesRes, atribuicoesRes, recentEbooksRes] = await Promise.all([
    supabase.from('ebooks').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'cliente'),
    supabase.from('user_ebooks').select('*', { count: 'exact', head: true }),
    supabase.from('ebooks').select('id, title, cover_url, price, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const totalEbooks = ebooksRes.count || 0
  const totalClientes = clientesRes.count || 0
  const totalAtribuicoes = atribuicoesRes.count || 0
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
        <div className="glass-card stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{totalEbooks}</div>
          <div className="stat-label">E-books cadastrados</div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{totalClientes}</div>
          <div className="stat-label">Clientes registrados</div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon">🔗</div>
          <div className="stat-value">{totalAtribuicoes}</div>
          <div className="stat-label">Atribuições realizadas</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
        <h3 style={{ marginBottom: 'var(--space-lg)' }}>E-books Recentes</h3>
        {recentEbooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>Nenhum e-book cadastrado</h3>
            <p>Comece adicionando seu primeiro e-book.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
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
                        <div className="table-thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📖</div>
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
