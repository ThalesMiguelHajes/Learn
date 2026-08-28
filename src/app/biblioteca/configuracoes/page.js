import { requireCliente } from '@/lib/auth'
import SettingsView from '@/components/settings/SettingsView'

export const metadata = {
  title: 'Configurações — KodaBooks',
}

export default async function BibliotecaConfiguracoesPage() {
  const { user } = await requireCliente()

  return <SettingsView email={user.email} />
}
