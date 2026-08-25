'use client'

import { useState } from 'react'
import NovaVendaModal from '@/components/admin/NovaVendaModal'

export default function VendasClient({ sales, totalRevenue, users, ebooks }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-header-left">
          <h1>Vendas Financeiras</h1>
          <p>Gerencie o faturamento e atribua e-books aos clientes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Registrar Venda
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: 'var(--space-xl)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>Faturamento Total (Arrecadado)</h3>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-display)' }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
        </div>
      </div>

      <div className="table-container">
        {sales.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h3>Nenhuma venda registrada</h3>
            <p>Clique no botão acima para registrar sua primeira venda.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>E-books Vendidos</th>
                <th>Valor Cobrado</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{sale.profiles?.full_name || '—'}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{sale.profiles?.email}</div>
                  </td>
                  <td>
                    {sale.sale_items?.length || 0} e-book(s)
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total_amount)}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <NovaVendaModal 
          users={users}
          ebooks={ebooks}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
