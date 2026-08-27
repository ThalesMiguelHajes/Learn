import { createClient } from '@/lib/supabase/server'
import CatalogCard from '@/components/biblioteca/CatalogCard'
import SearchBar from '@/components/biblioteca/SearchBar'
import { Suspense } from 'react'
import Image from 'next/image'
import { IconSearch } from '@/components/icons'

export const metadata = {
  title: 'Catálogo — KodaBooks',
}

export default async function CatalogoPage({ searchParams }) {
  const { q } = await searchParams || {}
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  let query = supabase
    .from('ebooks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  const { data: ebooks, error } = await query

  // Buscar os e-books que o usuário já possui
  let ownedEbookIds = []
  if (user) {
    const { data: userEbooks } = await supabase
      .from('user_ebooks')
      .select('ebook_id')
      .eq('user_id', user.id)
    
    if (userEbooks) {
      ownedEbookIds = userEbooks.map(ue => ue.ebook_id)
    }
  }

  return (
    <div className="biblioteca-page">
      <div className="page-header">
        <div>
          <h2>Catálogo de E-books</h2>
          <p className="text-secondary">O que você vai aprender hoje? Escolha seu próximo e-book.</p>
        </div>
      </div>
      
      <Suspense fallback={<div className="loading-page" style={{minHeight: '40vh'}}><Image src="/scorpionbits-logo.png" alt="Carregando" width={60} height={60} className="loading-logo-pulse" /></div>}>
        <SearchBar placeholder="Buscar no catálogo..." />
      </Suspense>

      {error && (
        <div className="form-feedback form-feedback-error mb-lg">
          Erro ao carregar o catálogo.
        </div>
      )}

      {!ebooks || ebooks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><IconSearch size={40} /></div>
          <h3>{q ? 'Nenhum resultado' : 'Nenhum e-book disponível'}</h3>
          <p>{q ? `Não encontramos nenhum e-book correspondente a "${q}". Tente outros termos!` : 'Ainda não há e-books publicados no catálogo.'}</p>
        </div>
      ) : (
        <div className="ebook-grid">
          {ebooks.map((ebook, idx) => {
            const hasEbook = ownedEbookIds.includes(ebook.id)
            return (
              <CatalogCard key={ebook.id} ebook={ebook} index={idx} hasEbook={hasEbook} />
            )
          })}
        </div>
      )}
    </div>
  )
}
