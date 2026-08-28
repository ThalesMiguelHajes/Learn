import { requireAdmin } from '@/lib/auth'
import SettingsView from '@/components/settings/SettingsView'

export const metadata = {
  title: 'Configurações — Painel Admin',
}

export default async function AdminConfiguracoesPage() {
  const { user } = await requireAdmin()

  return <SettingsView email={user.email} />
}
