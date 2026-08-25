import { requireAdmin } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Painel Admin — KodaBooks',
}

export default async function AdminLayout({ children }) {
  const { profile } = await requireAdmin()

  return (
    <div className="admin-layout">
      <AdminSidebar profile={profile} />
      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}
