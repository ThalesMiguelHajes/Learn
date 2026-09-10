import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import CatalogCard from '@/components/biblioteca/CatalogCard'
import SearchBar from '@/components/biblioteca/SearchBar'
import { Suspense } from 'react'
import Image from 'next/image'
import { IconSearch } from '@/components/icons'

export const metadata = {
  title: 'Catálogo — KodaBooks',
}

export default async function CatalogoPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams?.q
  const supabase = await createClient()

  const { user } = await getUser()

  let queryEbooks = supabase.from('ebooks').select('*').eq('is_active', true)
  let queryMaterials = supabase.from('materials').select('*').eq('is_active', true)
  let queryCourses = supabase.from('courses').select('*').eq('is_active', true)

  if (q) {
    queryEbooks = queryEbooks.ilike('title', `%${q}%`)
    queryMaterials = queryMaterials.ilike('title', `%${q}%`)
    queryCourses = queryCourses.ilike('title', `%${q}%`)
  }

  const [
    { data: ebooksData },
    { data: materialsData },
    { data: coursesData }
  ] = await Promise.all([queryEbooks, queryMaterials, queryCourses])

  let allProducts = []
  if (ebooksData) allProducts.push(...ebooksData.map(e => ({ ...e, itemType: 'ebook' })))
  if (materialsData) allProducts.push(...materialsData.map(m => ({ ...m, itemType: 'material' })))
  if (coursesData) allProducts.push(...coursesData.map(c => ({ ...c, itemType: 'course' })))

  allProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  // Buscar os produtos que o usuário já possui
  let ownedEbookIds = []
  let ownedMaterialIds = []
  let ownedCourseIds = []

  if (user) {
    const { data: userEbooks } = await supabase.from('user_ebooks').select('ebook_id').eq('user_id', user.id)
    if (userEbooks) ownedEbookIds = userEbooks.map(ue => ue.ebook_id)

    const { data: userMaterials } = await supabase.from('user_materials').select('material_id').eq('user_id', user.id)
    if (userMaterials) ownedMaterialIds = userMaterials.map(um => um.material_id)

    const { data: userCourses } = await supabase.from('user_courses').select('course_id').eq('user_id', user.id)
    if (userCourses) ownedCourseIds = userCourses.map(uc => uc.course_id)
  }

  return (
    <div className="biblioteca-page">
      <div className="page-header">
        <div>
          <h2>Catálogo</h2>
          <p className="text-secondary">O que você vai aprender hoje? Escolha seu próximo material.</p>
        </div>
      </div>
      
      <Suspense fallback={<div className="loading-page" style={{minHeight: '40vh'}}><Image src="/scorpionbits-logo.png" alt="Carregando" width={60} height={60} className="loading-logo-pulse" /></div>}>
        <SearchBar placeholder="Buscar no catálogo..." />
      </Suspense>

      {allProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><IconSearch size={40} /></div>
          <h3>{q ? 'Nenhum resultado' : 'Nenhum produto disponível'}</h3>
          <p>{q ? `Não encontramos nada correspondente a "${q}". Tente outros termos!` : 'Ainda não há produtos publicados no catálogo.'}</p>
        </div>
      ) : (
        <div className="ebook-grid">
          {allProducts.map((product, idx) => {
            let hasItem = false
            if (product.itemType === 'ebook') hasItem = ownedEbookIds.includes(product.id)
            if (product.itemType === 'material') hasItem = ownedMaterialIds.includes(product.id)
            if (product.itemType === 'course') hasItem = ownedCourseIds.includes(product.id)

            return (
              <CatalogCard key={`${product.itemType}-${product.id}`} ebook={product} index={idx} hasEbook={hasItem} itemType={product.itemType} />
            )
          })}
        </div>
      )}
    </div>
  )
}
