'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminSidebar({ profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/ebooks', label: 'E-books', icon: '📚' },
    { href: '/admin/usuarios', label: 'Usuários', icon: '👥' },
    { href: '/admin/atribuicoes', label: 'Atribuições', icon: '🔗' },
  ]

  function isActive(href) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AD'

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div>
          <span className="sidebar-logo">
            <span className="text-gradient">Koda</span>Books
          </span>
          <span className="sidebar-badge">Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', opacity: 0.9 }}>
          <img src="/scorpionbits-logo.png" alt="ScorpionBits Logo" style={{ width: '20px', height: '20px', filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em', textTransform: 'uppercase' }}>ScorpionBits</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Menu</span>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{profile?.full_name || 'Admin'}</div>
            <div className="sidebar-user-role">Administrador</div>
          </div>
        </div>
        <button
          className="btn btn-secondary w-full"
          onClick={handleLogout}
          style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sair do Painel
        </button>
      </div>
    </aside>
  )
}
