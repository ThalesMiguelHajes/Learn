'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ClientHeader({ profile }) {
  const supabase = createClient()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="biblioteca-header">
      <div className="biblioteca-header-logo">
        <span className="text-gradient">Koda</span>Books
      </div>
      <div className="biblioteca-header-right">
        <span className="biblioteca-header-user">
          Olá, <strong style={{ color: 'var(--text-primary)' }}>{profile?.full_name?.split(' ')[0] || 'Usuário'}</strong>
        </span>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          🚪 Sair
        </button>
      </div>
    </header>
  )
}
