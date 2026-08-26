import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import AutoRefresh from '@/components/biblioteca/AutoRefresh'

export const metadata = {
  title: 'Status do Pagamento — KodaBooks',
}

export default async function SucessoPage({ searchParams }) {
  const { ebook: ebookId } = await searchParams || {}

  if (!ebookId) {
    redirect('/biblioteca')
  }

  const supabase = await createClient()

  // 1. Verificar se o usuário está autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Buscar dados do e-book
  const { data: ebook } = await supabase
    .from('ebooks')
    .select('id, title, cover_url')
    .eq('id', ebookId)
    .single()

  // 3. Verificar se o e-book JÁ está liberado (webhook chegou rápido ou já tinha)
  const { data: hasEbook } = await supabase
    .from('user_ebooks')
    .select('id')
    .eq('user_id', user.id)
    .eq('ebook_id', ebookId)
    .single()

  // Se já tem, sucesso absoluto
  const isPaid = !!hasEbook

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-xl)',
    }}>
      <div className="glass-card animate-in" style={{
        maxWidth: '480px',
        width: '100%',
        padding: 'var(--space-2xl)',
        textAlign: 'center',
      }}>
        {!isPaid && <AutoRefresh intervalMs={3000} />}

        {/* Ícone dinâmico */}
        <div style={{
          fontSize: '4rem',
          marginBottom: 'var(--space-md)',
          animation: isPaid ? 'pulse 1s ease-in-out' : 'spin 2s linear infinite',
        }}>
          {isPaid ? '🎉' : '⏳'}
        </div>

        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-sm)',
          fontFamily: 'var(--font-display)',
        }}>
          {isPaid ? 'Pagamento Confirmado!' : 'Aguardando Pagamento...'}
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-xl)',
          lineHeight: 1.6,
        }}>
          {isPaid
            ? <>Seu e-book <strong style={{ color: 'var(--text-primary)' }}>"{ebook?.title}"</strong> já está disponível na sua biblioteca.</>
            : <>Estamos aguardando a confirmação do PIX pela AbacatePay para liberar o seu acesso. Esta página vai atualizar automaticamente.</>
          }
        </p>

        {/* Miniatura do e-book */}
        {ebook?.cover_url && (
          <div style={{
            marginBottom: 'var(--space-xl)',
            display: 'flex',
            justifyContent: 'center',
            opacity: isPaid ? 1 : 0.5, // Fica meio transparente enquanto aguarda
            transition: 'opacity 0.3s',
          }}>
            <img
              src={ebook.cover_url}
              alt={`Capa de ${ebook.title}`}
              style={{
                width: '120px',
                height: '160px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        )}

        {/* Barra de status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xs)',
          justifyContent: 'center',
          marginBottom: 'var(--space-xl)',
          fontSize: '0.8rem',
          color: 'var(--text-tertiary)',
        }}>
          <span style={{ color: 'var(--accent-primary)' }}>✅ Checkout</span>
          <span>→</span>
          <span style={{ color: isPaid ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>
            {isPaid ? '✅ Pago' : '⏳ Processando'}
          </span>
          <span>→</span>
          <span style={{ color: isPaid ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>
            {isPaid ? '✅ Liberado' : '⏳ Liberado'}
          </span>
        </div>

        {/* Botões */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)',
        }}>
          {isPaid ? (
            <Link
              href={ebook ? `/biblioteca/livro/${ebook.id}` : '/biblioteca'}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              📖 Ler agora
            </Link>
          ) : (
            <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>
              Verificando automaticamente... não feche a página.
            </div>
          )}
          
          <Link
            href="/biblioteca"
            className={isPaid ? "btn btn-secondary" : "btn btn-primary"}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Ir para minha Biblioteca
          </Link>
        </div>
      </div>
    </div>
  )
}
