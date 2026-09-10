import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import SearchBar from '@/components/biblioteca/SearchBar'
import Pagination from '@/components/ui/Pagination'
import CoursesTable from './CoursesTable'
import { IconPlus, IconBooks } from '@/components/icons'

const PAGE_SIZE = 20

export default async function CursosListPage({ searchParams }) {
  await requireAdmin()
  const { q, page: pageParam } = await searchParams || {}
  const page = Math.max(1, parseInt(pageParam, 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  let query = supabase
    .from('courses')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (q) query = query.ilike('title', `%${q}%`)

  const { data: courses, count } = await query.range(from, to)

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Cursos</h1>
          <p>Gerencie seus cursos em vídeo e módulos.</p>
        </div>
        <Link href="/admin/cursos/novo" className="btn btn-primary">
          <IconPlus size={16} /> Novo Curso
        </Link>
      </div>

      <Suspense fallback={<div className="search-bar mb-lg" />}>
        <SearchBar placeholder="Buscar por título..." />
      </Suspense>

      {!courses || courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><IconBooks size={40} /></div>
          <h3>{q ? 'Nenhum resultado encontrado' : 'Nenhum curso cadastrado'}</h3>
          <p>{q ? 'Tente outro termo de busca.' : 'Comece adicionando seu primeiro curso.'}</p>
        </div>
      ) : (
        <>
          <CoursesTable courses={courses} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={count || 0} extraParams={q ? { q } : {}} />
        </>
      )}
    </>
  )
}
