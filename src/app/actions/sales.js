'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createSale({ userId, items, totalAmount }) {
  if (!userId || !items || items.length === 0) {
    return { error: 'Cliente e itens são obrigatórios.' }
  }

  const { user } = await requireAdmin()
  const supabase = await createClient()

  // 1. Criar a venda na tabela sales
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert([{ user_id: userId, total_amount: parseFloat(totalAmount) || 0 }])
    .select()
    .single()

  if (saleError) {
    console.error('Erro ao registrar venda:', saleError)
    return { error: 'Erro ao registrar a venda.' }
  }

  // 2. Criar os itens da venda em sale_items (polimórfico)
  const saleItems = items.map(item => ({ sale_id: sale.id, item_id: item.id, item_type: item.type }))
  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItems)

  if (itemsError) {
    console.error('Erro ao registrar itens da venda:', itemsError)
  }

  // 3. Atribuir os itens ao usuário
  for (const item of items) {
    let tableName = ''
    let idCol = ''
    if (item.type === 'ebook') { tableName = 'user_ebooks'; idCol = 'ebook_id' }
    else if (item.type === 'material') { tableName = 'user_materials'; idCol = 'material_id' }
    else if (item.type === 'course') { tableName = 'user_courses'; idCol = 'course_id' }

    if (tableName) {
      await supabase
        .from(tableName)
        .upsert([{ user_id: userId, [idCol]: item.id, assigned_by: user.id }], { onConflict: `user_id,${idCol}` })
    }
  }

  revalidatePath('/admin/vendas')
  revalidatePath('/admin/atribuicoes')
  
  return { success: true }
}
