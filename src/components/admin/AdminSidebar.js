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
        <span className="sidebar-logo">
          <span className="text-gradient">Koda</span>Books
        </span>
        <span className="sidebar-badge">Admin</span>
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
          className="sidebar-link w-full"
          onClick={handleLogout}
          style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%', marginTop: '4px' }}
        >
          <span className="icon">🚪</span>
          Sair
        </button>
      </div>
    </aside>
  )
}
