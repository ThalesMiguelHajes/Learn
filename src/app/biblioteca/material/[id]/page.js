import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'
import MaterialActions from '@/components/biblioteca/MaterialActions'
import { IconArrowLeft, IconBookOpen } from '@/components/icons'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: material } = await supabase
    .from('materials')
    .select('title')
    .eq('id', id)
    .single()

  return {
    title: material ? `${material.title} — Learn` : 'Detalhes do Livro — Learn',
  }
}

export default async function DetalhesLivroPage({ params }) {
  const { id } = await params
  const { user } = await requireAuth()
  const supabase = await createClient()

  // Verificar se o usuário possui este material diretamente
  const { data: ownership } = await supabase
    .from('user_materials')
    .select('id')
    .eq('user_id', user.id)
    .eq('material_id', id)
    .single()

  let hasAccess = !!ownership

  // Se não possuir diretamente, verificar se possui através de um curso
  if (!hasAccess) {
    const { data: courseAccess } = await supabase
      .from('course_materials')
      .select('course_id, user_courses!inner(user_id)')
      .eq('material_id', id)
      .eq('user_courses.user_id', user.id)
      .limit(1)

    if (courseAccess && courseAccess.length > 0) {
      hasAccess = true
    }
  }

  if (!hasAccess) {
    return (
      <div className="center-message-page">
        <div className="glass-card center-message-card">
          <h2>Acesso Negado</h2>
          <p>Você não possui acesso a este material.</p>
          <Link href="/biblioteca" className="btn btn-primary mt-md">
            Voltar para a Biblioteca
          </Link>
        </div>
      </div>
    )
  }

  // Buscar detalhes do e-book
  const { data: material } = await supabase
    .from('materials')
    .select('*')
    .eq('id', id)
    .single()

  if (!material) {
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
          {material.cover_url ? (
            <Image src={material.cover_url} alt={`Capa de ${material.title}`} fill style={{ objectFit: 'cover' }} sizes="300px" priority />
          ) : (
            <div className="cover-placeholder"><IconBookOpen size={48} /></div>
          )}
        </div>

        <div className="livro-info">
          {material.material_type && (
            <span className="badge badge-info">{material.material_type.toUpperCase()}</span>
          )}
          <h1>{material.title}</h1>
          
          <div className="livro-description">
            {material.description ? (
              <p>{material.description}</p>
            ) : (
              <p className="text-secondary">Nenhuma descrição disponível para este e-book.</p>
            )}
          </div>
          
          <MaterialActions
            materialId={material.id}
            fileType={material.material_type}
          />
        </div>
      </div>
    </div>
  )
}
