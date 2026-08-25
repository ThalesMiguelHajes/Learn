'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

export default function ClientHeader({ profile }) {
  const supabase = createClient()
  const router = useRouter()

  const pathname = usePathname()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="biblioteca-header">
      <div className="biblioteca-header-logo" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div>
          <span className="text-gradient">Koda</span>Books
        </div>
        <div style={{ height: '24px', width: '1px', background: 'var(--border-default)' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9 }}>
          <img src="/scorpionbits-logo.png" alt="ScorpionBits Logo" style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>ScorpionBits</span>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '8px', background: 'var(--bg-glass)', padding: '4px', borderRadius: 'var(--radius-full)' }}>
        <a 
          href="/biblioteca" 
          style={{ 
            padding: '6px 16px', 
            borderRadius: 'var(--radius-full)', 
            fontSize: '0.875rem', 
            fontWeight: 600,
            background: pathname === '/biblioteca' ? 'var(--accent-gradient-soft)' : 'transparent',
            color: pathname === '/biblioteca' ? 'var(--accent-secondary)' : 'var(--text-secondary)'
          }}
        >
          Minha Biblioteca
        </a>
        <a 
          href="/biblioteca/catalogo" 
          style={{ 
            padding: '6px 16px', 
            borderRadius: 'var(--radius-full)', 
            fontSize: '0.875rem', 
            fontWeight: 600,
            background: pathname === '/biblioteca/catalogo' ? 'var(--accent-gradient-soft)' : 'transparent',
            color: pathname === '/biblioteca/catalogo' ? 'var(--accent-secondary)' : 'var(--text-secondary)'
          }}
        >
          Catálogo
        </a>
      </nav>

      <div className="biblioteca-header-right">
        <span className="biblioteca-header-user">
          Olá, <strong style={{ color: 'var(--text-primary)' }}>{profile?.full_name?.split(' ')[0] || 'Usuário'}</strong>
        </span>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={handleLogout}
          style={{ padding: '0.4rem 0.8rem', gap: '6px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sair
        </button>
      </div>
    </header>
  )
}
