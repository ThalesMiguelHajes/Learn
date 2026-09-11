import React from 'react'

export default function Loading() {
  return (
    <div className="page-shell">
      <header className="landing-header">
        <div className="landing-header-brand">
          <h1 className="landing-logo">
            <span className="text-gradient">Koda</span>Books
          </h1>
        </div>
      </header>

      <main style={{ padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Skeleton do Hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%', maxWidth: '800px' }}>
          <div style={{ width: '80%', height: '48px', background: 'var(--bg-glass)', borderRadius: '12px', animation: 'pulse 2s infinite' }} />
          <div style={{ width: '60%', height: '24px', background: 'var(--bg-glass)', borderRadius: '12px', animation: 'pulse 2s infinite' }} />
          <div style={{ width: '200px', height: '56px', background: 'var(--bg-glass)', borderRadius: '12px', animation: 'pulse 2s infinite', marginTop: '1rem' }} />
        </div>

        {/* Skeleton das Features */}
        <div style={{ display: 'flex', gap: '1.5rem', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card" style={{ flex: '1 1 300px', height: '180px', animation: 'pulse 2s infinite' }} />
          ))}
        </div>

        {/* Skeleton do Grid de Produtos */}
        <div style={{ width: '100%', marginTop: '2rem' }}>
          <div style={{ width: '300px', height: '32px', background: 'var(--bg-glass)', borderRadius: '8px', animation: 'pulse 2s infinite', margin: '0 auto 2rem auto' }} />
          
          <div className="ebook-grid" style={{ width: '100%' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-card ebook-card" style={{ height: '320px', animation: 'pulse 2s infinite' }} />
            ))}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
