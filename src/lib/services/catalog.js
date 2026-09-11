import { createServiceClient } from '@/lib/supabase/server'

/**
 * Busca os itens em destaque (e-books, materiais e cursos) para a página inicial.
 */
export async function getFeaturedCatalog() {
  const supabase = createServiceClient()

  try {
    const [ebooksRes, materialsRes, coursesRes] = await Promise.all([
      supabase.from('ebooks').select('*').eq('is_active', true).limit(4),
      supabase.from('materials').select('*').eq('is_active', true).limit(4),
      supabase.from('courses').select('*').eq('is_active', true).limit(4)
    ])

    if (ebooksRes.error) throw ebooksRes.error
    if (materialsRes.error) throw materialsRes.error
    if (coursesRes.error) throw coursesRes.error

    return {
      ebooks: ebooksRes.data || [],
      materials: materialsRes.data || [],
      courses: coursesRes.data || []
    }
  } catch (error) {
    console.error('Erro no serviço getFeaturedCatalog:', error)
    throw error // Propaga o erro para o componente lidar com ele
  }
}
