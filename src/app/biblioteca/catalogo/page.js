import { createClient } from '@/lib/supabase/server'
import CatalogCard from '@/components/biblioteca/CatalogCard'

export const metadata = {
  title: 'Catálogo — KodaBooks',
}

export default async function CatalogoPage() {
  const supabase = await createClient()

  // Buscar todos os ebooks que estão ativos e que tenham capa ou título (Catálogo público)
  // Devido a RLS, o usuário cliente só pode ver o que permitimos
  // Precisamos adicionar a política no banco para que eles vejam os ativos
  const { data: ebooks, error } = await supabase
    .from('ebooks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="biblioteca-page">
      <div className="page-header">
        <div>
          <h2>Catálogo de E-books</h2>
          <p className="text-secondary">Descubra novos conteúdos para expandir sua biblioteca digital.</p>
        </div>
      </div>

      {error && (
        <div className="toast-error" style={{
          padding: 'var(--space-md)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--error-soft)',
          color: 'var(--error)',
          marginBottom: 'var(--space-lg)'
        }}>
          Erro ao carregar o catálogo.
        </div>
      )}

      {!ebooks || ebooks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>Catálogo Vazio</h3>
          <p>Não há e-books disponíveis para venda no momento. Volte mais tarde!</p>
        </div>
      ) : (
        <div className="ebook-grid">
          {ebooks.map((ebook, idx) => (
            <CatalogCard key={ebook.id} ebook={ebook} index={idx} />
          ))}
        </div>
      )}
    </div>
  )
}
