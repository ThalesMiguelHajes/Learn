'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconDashboard, IconWallet, IconBooks, IconUsers, IconLink, IconSettings } from '@/components/icons'
import PartnerBadge from '@/components/ui/PartnerBadge'
import Avatar from '@/components/ui/Avatar'

export default function AdminSidebar({ profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: IconDashboard },
    { href: '/admin/vendas', label: 'Vendas', icon: IconWallet },
    { href: '/admin/ebooks', label: 'E-books', icon: IconBooks },
    { href: '/admin/materiais', label: 'Materiais', icon: IconLink },
    { href: '/admin/cursos', label: 'Cursos', icon: IconDashboard },
    { href: '/admin/usuarios', label: 'Usuários', icon: IconUsers },
    { href: '/admin/atribuicoes', label: 'Atribuições', icon: IconLink },
    { href: '/admin/configuracoes', label: 'Configurações', icon: IconSettings },
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

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div>
          <span className="sidebar-logo">
            <span className="text-gradient">Koda</span>Books
          </span>
          <span className="sidebar-badge">Admin</span>
        </div>
        <div className="mt-md">
          <PartnerBadge />
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
            <span className="icon"><item.icon size={18} /></span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <Avatar name={profile?.full_name} fallback="AD" />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{profile?.full_name || 'Admin'}</div>
            <div className="sidebar-user-role">Administrador</div>
          </div>
        </div>
        <button
          className="btn btn-secondary w-full justify-center mt-md"
          onClick={handleLogout}
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
