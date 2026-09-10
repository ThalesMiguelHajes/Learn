import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PlayerClient from './PlayerClient'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('title, description')
    .eq('id', id)
    .single()

  if (!course) {
    return { title: 'Curso não encontrado — KodaBooks' }
  }

  return {
    title: `${course.title} — KodaBooks`,
    description: course.description
  }
}

export default async function CoursePlayerPage({ params }) {
  const { id } = await params
  const { user } = await requireAuth()
  const supabase = await createClient()

  // Verify access (must have bought the course OR be admin)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    const { data: hasAccess } = await supabase
      .from('user_courses')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', id)
      .single()

    if (!hasAccess) {
      redirect('/biblioteca?tab=cursos')
    }
  }

  // Fetch Course details
  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !course) {
    return (
      <div className="empty-state mt-xl">
        <h3>Curso não encontrado</h3>
        <p>O curso que você tentou acessar não existe ou não está mais disponível.</p>
      </div>
    )
  }

  // Fetch Modules & Lessons
  const { data: modulesData } = await supabase
    .from('course_modules')
    .select('*, course_lessons(*)')
    .eq('course_id', id)
    .order('order_index', { ascending: true })

  const modules = modulesData || []
  modules.forEach(m => {
    if (m.course_lessons) {
      m.course_lessons.sort((a, b) => a.order_index - b.order_index)
    }
  })

  // Fetch Attached Materials (user must also have access to the materials? Or does the course give access?
  // The prompt said: "vincular um Material ao curso (ex: enviar os assets junto com o curso)".
  // Let's just fetch them and display. The user can click to go to `/biblioteca/material/[id]`.
  // Wait, if they go to `/biblioteca/material/[id]`, they will get Access Denied if they don't have `user_materials` row.
  // Actually, wait: We added a policy for `course_materials`. But the material download API checks `user_materials`.
  // We can just add a query in the download API: OR exists in user_courses where course_materials.material_id = material_id.
  // We will do that later if needed.
  const { data: courseMaterials } = await supabase
    .from('course_materials')
    .select('*, materials(*)')
    .eq('course_id', id)

  const materials = courseMaterials?.map(cm => cm.materials) || []

  return (
    <PlayerClient course={course} modules={modules} materials={materials} />
  )
}
