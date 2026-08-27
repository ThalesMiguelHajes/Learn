import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import EbookActions from '@/components/biblioteca/EbookActions'
import { IconArrowLeft, IconBookOpen } from '@/components/icons'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: ebook } = await supabase
    .from('ebooks')
    .select('title')
    .eq('id', id)
    .single()

  return {
    title: ebook ? `${ebook.title} — KodaBooks` : 'Detalhes do Livro — KodaBooks',
  }
}

export default async function DetalhesLivroPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar se o usuário possui este e-book
  const { data: ownership } = await supabase
    .from('user_ebooks')
    .select('id')
    .eq('user_id', user.id)
    .eq('ebook_id', id)
    .single()

  if (!ownership) {
    return (
      <div className="center-message-page">
        <div className="glass-card center-message-card">
          <h2>Acesso Negado</h2>
          <p>Você não possui acesso a este e-book.</p>
          <Link href="/biblioteca" className="btn btn-primary mt-md">
            Voltar para a Biblioteca
          </Link>
        </div>
      </div>
    )
  }

  // Buscar detalhes do e-book
  const { data: ebook } = await supabase
    .from('ebooks')
    .select('*')
    .eq('id', id)
    .single()

  if (!ebook) {
    return (
      <div className="center-message-page">
        <div className="glass-card center-message-card">
          <h2>Livro não encontrado</h2>
          <Link href="/biblioteca" className="btn btn-primary mt-md">
            Voltar para a Biblioteca
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="livro-details-page">
      <Link href="/biblioteca" className="back-link">
        <IconArrowLeft size={16} /> Voltar
      </Link>

      <div className="glass-card livro-details-layout">
        <div className="livro-cover-large">
          {ebook.cover_url ? (
            <Image src={ebook.cover_url} alt={`Capa de ${ebook.title}`} fill style={{ objectFit: 'cover' }} sizes="300px" priority />
          ) : (
            <div className="cover-placeholder"><IconBookOpen size={48} /></div>
          )}
        </div>

        <div className="livro-info">
          {ebook.file_type && (
            <span className="badge badge-info">{ebook.file_type.toUpperCase()}</span>
          )}
          <h1>{ebook.title}</h1>
          
          <div className="livro-description">
            {ebook.description ? (
              <p>{ebook.description}</p>
            ) : (
              <p className="text-secondary">Nenhuma descrição disponível para este e-book.</p>
            )}
          </div>
          
          <EbookActions
            ebookId={ebook.id}
            fileType={ebook.file_type}
          />
        </div>
      </div>
    </div>
  )
}
