'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import PartnerBadge from '@/components/ui/PartnerBadge'

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
      <div className="biblioteca-header-logo">
        <div>
          <span className="text-gradient">Koda</span>Books
        </div>
        <div className="biblioteca-header-divider"></div>
        <PartnerBadge size={24} />
      </div>

      <nav className="biblioteca-header-nav">
        <Link
          href="/biblioteca"
          className={`nav-link ${pathname === '/biblioteca' ? 'active' : ''}`}
        >
          Minha Biblioteca
        </Link>
        <Link
          href="/biblioteca/catalogo"
          className={`nav-link ${pathname === '/biblioteca/catalogo' ? 'active' : ''}`}
        >
          Catálogo
        </Link>
      </nav>

      <div className="biblioteca-header-right">
        <span className="biblioteca-header-user">
          Olá, <strong>{profile?.full_name?.split(' ')[0] || 'Usuário'}</strong>
        </span>
        <button 
          className="btn btn-secondary btn-sm logout-btn" 
          onClick={handleLogout}
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
