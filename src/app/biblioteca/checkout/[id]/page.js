import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import CheckoutClient from '@/components/biblioteca/CheckoutClient'

export const metadata = {
  title: 'Finalizar Compra — KodaBooks',
}

export default async function CheckoutPage({ params, searchParams }) {
  const itemId = params?.id
  const type = searchParams?.type
  const itemType = type || 'ebook'

  if (!itemId) {
    redirect('/biblioteca')
  }

  const { user } = await requireAuth()
  const supabase = await createClient()

  let tableName = 'ebooks'
  let ownershipTable = 'user_ebooks'
  let ownershipIdCol = 'ebook_id'

  if (itemType === 'material') {
    tableName = 'materials'
    ownershipTable = 'user_materials'
    ownershipIdCol = 'material_id'
  } else if (itemType === 'course') {
    tableName = 'courses'
    ownershipTable = 'user_courses'
    ownershipIdCol = 'course_id'
  }

  // 2. Buscar o item
  const { data: item } = await supabase
    .from(tableName)
    .select('id, title, cover_url, price, is_active')
    .eq('id', itemId)
    .single()

  if (!item || !item.is_active) {
    redirect('/biblioteca')
  }

  // 3. Verificar se o usuário já tem o item
  const { data: hasItem } = await supabase
    .from(ownershipTable)
    .select('id')
    .eq('user_id', user.id)
    .eq(ownershipIdCol, itemId)
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
