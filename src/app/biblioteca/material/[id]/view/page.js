import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { IconArrowLeft } from '@/components/icons'
import { redirect } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: material } = await supabase
    .from('materials')
    .select('title')
    .eq('id', id)
    .single()

  return {
    title: material ? `${material.title} — Apresentação` : 'Apresentação — KodaBooks',
  }
}

export default async function ViewMaterialPage({ params }) {
  const { id } = await params
  const { user } = await requireAuth()
  const supabase = await createClient()

  // Verify ownership
  let hasAccess = false
  const { data: ownership } = await supabase
    .from('user_materials')
    .select('id')
    .eq('user_id', user.id)
    .eq('material_id', id)
    .single()

  if (ownership) hasAccess = true

  if (!hasAccess) {
    const { data: courseAccess } = await supabase
      .from('course_materials')
      .select('course_id, user_courses!inner(user_id)')
      .eq('material_id', id)
      .eq('user_courses.user_id', user.id)
      .limit(1)

    if (courseAccess && courseAccess.length > 0) hasAccess = true
  }

  // Admin access
  if (!hasAccess) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile?.role === 'admin') hasAccess = true
  }

  if (!hasAccess) {
    redirect('/biblioteca')
  }

  const { data: material } = await supabase
    .from('materials')
    .select('id, title, material_type')
    .eq('id', id)
    .single()

  if (!material || material.material_type !== 'html_slides') {
    redirect('/biblioteca')
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      zIndex: 9999,
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'var(--background)' 
    }}>
      {/* Header Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '12px 24px', 
        backgroundColor: 'var(--surface)', 
        borderBottom: '1px solid var(--border)',
        gap: '16px'
      }}>
        <Link href={`/biblioteca/material/${material.id}`} className="btn btn-ghost btn-sm" style={{ padding: '8px' }}>
          <IconArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: '16px', fontWeight: '500', margin: 0 }}>{material.title}</h1>
      </div>
      
      {/* Interactive Frame */}
      <div style={{ flex: 1, position: 'relative', backgroundColor: '#000' }}>
        <iframe 
          src={`/api/materials/${material.id}/view/index.html`}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
          title={material.title}
        />
      </div>
    </div>
  )
}
