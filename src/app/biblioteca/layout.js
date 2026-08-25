import { requireCliente } from '@/lib/auth'
import ClientHeader from '@/components/biblioteca/ClientHeader'

export const metadata = {
  title: 'Minha Biblioteca — KodaBooks',
}

export default async function BibliotecaLayout({ children }) {
  const { profile } = await requireCliente()

  return (
    <div className="biblioteca-layout">
      <ClientHeader profile={profile} />
      <main className="biblioteca-content">
        {children}
      </main>
    </div>
  )
}
