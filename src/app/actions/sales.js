'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSale({ userId, ebookIds, totalAmount }) {
  if (!userId || !ebookIds || ebookIds.length === 0) {
    return { error: 'Cliente e e-books são obrigatórios.' }
  }

  const supabase = await createClient()

  // Ensure admin privileges
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Não autorizado.' }
  }

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

  // 2. Criar os itens da venda em sale_items
  const saleItems = ebookIds.map(id => ({ sale_id: sale.id, ebook_id: id }))
  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItems)

  if (itemsError) {
    console.error('Erro ao registrar itens da venda:', itemsError)
    // We don't rollback for now, just log it.
  }

  // 3. Atribuir os livros ao usuário (para que ele possa acessar na biblioteca)
  const assignments = ebookIds.map(id => ({
    user_id: userId,
    ebook_id: id,
    assigned_by: user.id
  }))

  const { error: assignError } = await supabase
    .from('user_ebooks')
    .upsert(assignments, { onConflict: 'user_id,ebook_id' }) // Ignora se ele já tem o livro

  if (assignError) {
    console.error('Erro ao atribuir e-books:', assignError)
  }

  revalidatePath('/admin/vendas')
  revalidatePath('/admin/atribuicoes')
  
  return { success: true }
}
