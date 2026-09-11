import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import CheckoutClient from '@/components/biblioteca/CheckoutClient'

export const metadata = {
  title: 'Finalizar Compra — Learn',
}

export default async function CheckoutPage({ params, searchParams }) {
  const { id: itemId } = await params
  const resolvedSearchParams = await searchParams
  const type = resolvedSearchParams?.type
  let itemType = type || 'ebook'

  if (!itemId) {
    redirect('/biblioteca')
  }

  const { user } = await requireAuth()
  const supabase = await createClient()

  const typeConfig = {
    ebook: { table: 'ebooks', ownershipTable: 'user_ebooks', ownershipIdCol: 'ebook_id' },
    material: { table: 'materials', ownershipTable: 'user_materials', ownershipIdCol: 'material_id' },
    course: { table: 'courses', ownershipTable: 'user_courses', ownershipIdCol: 'course_id' },
  }

  let selectedConfig = typeConfig[itemType] || typeConfig.ebook

  // 2. Buscar o item na tabela correspondente
  let { data: item } = await supabase
    .from(selectedConfig.table)
    .select('id, title, cover_url, price, is_active')
    .eq('id', itemId)
    .single()

  // Se não encontrar pelo tipo informado (ou se não foi passado ?type=), procura nos outros tipos
  if (!item) {
    const otherTypes = ['ebook', 'material', 'course'].filter((t) => t !== itemType)
    for (const altType of otherTypes) {
      const altConfig = typeConfig[altType]
      const { data: altItem } = await supabase
        .from(altConfig.table)
        .select('id, title, cover_url, price, is_active')
        .eq('id', itemId)
        .single()

      if (altItem) {
        item = altItem
        itemType = altType
        selectedConfig = altConfig
        break
      }
    }
  }

  if (!item || !item.is_active) {
    redirect('/biblioteca')
  }

  // 3. Verificar se o usuário já tem o item
  const { data: hasItem } = await supabase
    .from(selectedConfig.ownershipTable)
    .select('id')
    .eq('user_id', user.id)
    .eq(selectedConfig.ownershipIdCol, itemId)
    .single()

  if (hasItem) {
    redirect(`/biblioteca/sucesso?item=${itemId}&type=${itemType}`)
  }

  // 4. Buscar o perfil do usuário para pré-preencher CPF e Telefone (caso existam)
  const { data: profile } = await supabase
    .from('profiles')
    .select('cpf, phone')
    .eq('id', user.id)
    .single()

  return (
    <div className="checkout-page">
      <h1 className="checkout-page-title">
        Finalizar Compra
      </h1>

      <CheckoutClient ebook={item} userProfile={profile} itemType={itemType} />
    </div>
  )
}
