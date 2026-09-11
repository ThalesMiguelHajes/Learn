'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Registra o erro internamente ou em serviços de monitoramento
    console.error('Erro pego no Boundary da aplicação:', error)
  }, [error])

  return (
    <div className="page-shell">
      <header className="landing-header">
        <div className="landing-header-brand">
          <Link href="/">
            <h1 className="landing-logo">
              <span className="text-gradient">Koda</span>Books
            </h1>
          </Link>
        </div>
      </header>

      <main style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <svg style={{ margin: '0 auto', color: 'var(--error)' }} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          
          <h2 style={{ marginBottom: '1rem' }}>Ops, algo deu errado!</h2>
          
          <p className="text-secondary" style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
            Não foi possível carregar o conteúdo da página no momento. Pode ser uma instabilidade no nosso banco de dados.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => reset()} 
              className="btn btn-primary"
            >
              Tentar Novamente
            </button>
            <Link href="/login" className="btn btn-secondary">
              Acessar minha conta
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
