'use client'

import { useState } from 'react'
import NovaVendaModal from '@/components/admin/NovaVendaModal'
import { IconWallet, IconPlus } from '@/components/icons'

export default function VendasClient({ sales, totalRevenue, users, products }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Vendas Financeiras</h1>
          <p>Gerencie o faturamento e atribua produtos aos clientes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <IconPlus size={16} /> Registrar Venda
        </button>
      </div>

      <div className="glass-card stat-card-highlight panel mb-xl">
        <h3 className="stat-label mb-xs">Faturamento Total (Arrecadado)</h3>
        <div className="revenue-total">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
        </div>
      </div>

      <div className="table-container">
        {sales.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><IconWallet size={40} /></div>
            <h3>Nenhuma venda registrada</h3>
            <p>Clique no botão acima para registrar sua primeira venda.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Produtos Vendidos</th>
                <th>Valor Cobrado</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <div className="font-semibold">{sale.profiles?.full_name || '—'}</div>
                    <div className="text-tertiary" style={{ fontSize: '0.8125rem' }}>{sale.profiles?.email}</div>
                  </td>
                  <td>
                    {sale.sale_items?.length || 0} produto(s)
                  </td>
                  <td className="revenue-cell">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total_amount)}
                  </td>
                  <td className="text-secondary">
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
          products={products}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
