import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import AutoRefresh from '@/components/biblioteca/AutoRefresh'
import { IconCheckCircle, IconClock, IconBookOpen } from '@/components/icons'

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
    <div className="status-page">
      <div className="glass-card animate-in status-card">
        {!isPaid && <AutoRefresh intervalMs={3000} />}

        <div className={`status-icon ${isPaid ? 'status-icon-success' : 'status-icon-pending'}`}>
          {isPaid ? <IconCheckCircle size={36} /> : <IconClock size={36} />}
        </div>

        <h1 className="status-title">
          {isPaid ? 'Pagamento Confirmado!' : 'Aguardando Pagamento...'}
        </h1>

        <p className="status-desc">
          {isPaid
            ? <>Seu e-book <strong style={{ color: 'var(--text-primary)' }}>&ldquo;{ebook?.title}&rdquo;</strong> já está disponível na sua biblioteca.</>
            : <>Estamos aguardando a confirmação do PIX pela AbacatePay para liberar o seu acesso. Esta página vai atualizar automaticamente.</>
          }
        </p>

        {ebook?.cover_url && (
          <div className="status-cover" style={{ opacity: isPaid ? 1 : 0.5 }}>
            <img src={ebook.cover_url} alt={`Capa de ${ebook.title}`} />
          </div>
        )}

        <div className="status-steps">
          <span className="status-step status-step-active"><IconCheckCircle size={14} /> Checkout</span>
          <span>&rarr;</span>
          <span className={`status-step ${isPaid ? 'status-step-active' : ''}`}>
            {isPaid ? <IconCheckCircle size={14} /> : <IconClock size={14} />} {isPaid ? 'Pago' : 'Processando'}
          </span>
          <span>&rarr;</span>
          <span className={`status-step ${isPaid ? 'status-step-active' : ''}`}>
            {isPaid ? <IconCheckCircle size={14} /> : <IconClock size={14} />} Liberado
          </span>
        </div>

        <div className="status-actions">
          {isPaid ? (
            <Link
              href={ebook ? `/biblioteca/livro/${ebook.id}` : '/biblioteca'}
              className="btn btn-primary w-full justify-center"
            >
              <IconBookOpen size={16} /> Ler agora
            </Link>
          ) : (
            <div className="status-hint">
              Verificando automaticamente... não feche a página.
            </div>
          )}

          <Link
            href="/biblioteca"
            className={`btn ${isPaid ? 'btn-secondary' : 'btn-primary'} w-full justify-center`}
          >
            Ir para minha Biblioteca
          </Link>
        </div>
      </div>
    </div>
  )
}
