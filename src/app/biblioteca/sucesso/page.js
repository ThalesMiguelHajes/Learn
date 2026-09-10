import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import AutoRefresh from '@/components/biblioteca/AutoRefresh'
import { IconCheckCircle, IconClock, IconBookOpen } from '@/components/icons'

export const metadata = {
  title: 'Status do Pagamento — KodaBooks',
}

export default async function SucessoPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  const itemId = resolvedSearchParams?.item
  const oldEbookId = resolvedSearchParams?.ebook
  const type = resolvedSearchParams?.type
  const idToUse = itemId || oldEbookId
  let itemType = type || 'ebook'

  if (!idToUse) {
    redirect('/biblioteca')
  }

  const { user } = await requireAuth()
  const supabase = await createClient()

  const typeConfig = {
    ebook: {
      table: 'ebooks',
      ownershipTable: 'user_ebooks',
      ownershipIdCol: 'ebook_id',
      linkTo: `/biblioteca/livro/${idToUse}`,
      label: 'e-book',
    },
    material: {
      table: 'materials',
      ownershipTable: 'user_materials',
      ownershipIdCol: 'material_id',
      linkTo: `/biblioteca/material/${idToUse}`,
      label: 'material',
    },
    course: {
      table: 'courses',
      ownershipTable: 'user_courses',
      ownershipIdCol: 'course_id',
      linkTo: `/biblioteca/cursos/${idToUse}`,
      label: 'curso',
    },
  }

  let selectedConfig = typeConfig[itemType] || typeConfig.ebook

  // 2. Buscar dados do item
  let { data: itemData } = await supabase
    .from(selectedConfig.table)
    .select('id, title, cover_url')
    .eq('id', idToUse)
    .single()

  // Se não encontrar pelo tipo informado, procura nos outros tipos
  if (!itemData) {
    const otherTypes = ['ebook', 'material', 'course'].filter((t) => t !== itemType)
    for (const altType of otherTypes) {
      const altConfig = typeConfig[altType]
      const { data: altItem } = await supabase
        .from(altConfig.table)
        .select('id, title, cover_url')
        .eq('id', idToUse)
        .single()

      if (altItem) {
        itemData = altItem
        itemType = altType
        selectedConfig = altConfig
        break
      }
    }
  }

  const { ownershipTable, ownershipIdCol, linkTo, label } = selectedConfig

  // 3. Verificar se o item JÁ está liberado (webhook chegou rápido ou já tinha)
  const { data: hasItem } = await supabase
    .from(ownershipTable)
    .select('id')
    .eq('user_id', user.id)
    .eq(ownershipIdCol, idToUse)
    .single()

  // Se já tem, sucesso absoluto
  const isPaid = !!hasItem

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
            ? <>Seu {label} <strong style={{ color: 'var(--text-primary)' }}>&ldquo;{itemData?.title}&rdquo;</strong> já está disponível na sua biblioteca.</>
            : <>Estamos aguardando a confirmação do PIX pela AbacatePay para liberar o seu acesso. Esta página vai atualizar automaticamente.</>
          }
        </p>

        {itemData?.cover_url && (
          <div className="status-cover" style={{ opacity: isPaid ? 1 : 0.5 }}>
            <Image src={itemData.cover_url} alt={`Capa de ${itemData.title}`} width={120} height={160} />
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
              href={itemData ? linkTo : '/biblioteca'}
              className="btn btn-primary w-full justify-center"
            >
              <IconBookOpen size={16} /> Acessar agora
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
