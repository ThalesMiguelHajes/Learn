'use client'

import { useState, useEffect, use, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { BUCKETS, ACCEPTED_COVER_TYPES } from '@/lib/constants'
import { IconArrowLeft, IconCheck, IconPlus, IconTrash, IconEdit, IconImage, IconLink } from '@/components/icons'
import Modal from '@/components/ui/Modal'

export default function EditarCursoPage({ params }) {
  const { id: courseId } = use(params)
  const [course, setCourse] = useState(null)
  
  // Basic info state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [coverUrl, setCoverUrl] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const coverInputRef = useRef(null)

  // Modules & Lessons
  const [modules, setModules] = useState([])
  const [activeModule, setActiveModule] = useState(null) // For editing module title
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false)
  const [moduleTitleInput, setModuleTitleInput] = useState('')

  const [activeLesson, setActiveLesson] = useState(null)
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
  const [lessonData, setLessonData] = useState({ title: '', video_url: '', content: '' })

  // Materials
  const [courseMaterials, setCourseMaterials] = useState([])
  const [allMaterials, setAllMaterials] = useState([])
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  async function fetchCourseData() {
    setLoading(true)
    
    // 1. Course Details
    const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single()
    if (courseData) {
      setCourse(courseData)
      setTitle(courseData.title)
      setDescription(courseData.description || '')
      setPrice(courseData.price)
      setIsActive(courseData.is_active)
      setCoverUrl(courseData.cover_url)
    }

    // 2. Modules and Lessons
    const { data: mods } = await supabase
      .from('course_modules')
      .select('*, course_lessons(*)')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (mods) {
      mods.forEach(m => {
        if (m.course_lessons) {
          m.course_lessons.sort((a, b) => a.order_index - b.order_index)
        }
      })
      setModules(mods)
    }

    // 3. Materials
    const { data: cm } = await supabase
      .from('course_materials')
      .select('*, materials(*)')
      .eq('course_id', courseId)
    if (cm) setCourseMaterials(cm.map(item => item.materials))

    const { data: mats } = await supabase.from('materials').select('id, title').eq('is_active', true)
    if (mats) setAllMaterials(mats)

    setLoading(false)
  }

  async function saveBasicInfo(e) {
    e?.preventDefault()
    setSaving(true)
    setFeedback(null)

    try {
      let finalCoverUrl = coverUrl
      
      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
        const { error: uploadError } = await supabase.storage.from(BUCKETS.COVERS).upload(path, coverFile)
        if (uploadError) throw new Error('Erro ao enviar nova capa')
        const { data } = supabase.storage.from(BUCKETS.COVERS).getPublicUrl(path)
        finalCoverUrl = data.publicUrl
      }

      const { error } = await supabase.from('courses').update({
        title,
        description,
        price: parseFloat(price) || 0,
        is_active: isActive,
        cover_url: finalCoverUrl
      }).eq('id', courseId)

      if (error) throw new Error('Erro ao salvar os dados básicos')
      setFeedback({ type: 'success', msg: 'Curso atualizado com sucesso!' })
      if (coverFile) setCoverFile(null)
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message })
    } finally {
      setSaving(false)
    }
  }

  // --- MODULE ACTIONS ---
  async function saveModule() {
    if (!moduleTitleInput.trim()) return
    setSaving(true)
    
    if (activeModule) { // Edit
      await supabase.from('course_modules').update({ title: moduleTitleInput }).eq('id', activeModule.id)
    } else { // Create
      await supabase.from('course_modules').insert({
        course_id: courseId,
        title: moduleTitleInput,
        order_index: modules.length
      })
    }
    
    setIsModuleModalOpen(false)
    setModuleTitleInput('')
    setActiveModule(null)
    setSaving(false)
    fetchCourseData()
  }

  async function deleteModule(modId) {
    if (!confirm('Tem certeza? Isso apagará o módulo e todas as suas aulas.')) return
    await supabase.from('course_modules').delete().eq('id', modId)
    fetchCourseData()
  }

  // --- LESSON ACTIONS ---
  function openLessonModal(modId, lesson = null) {
    setActiveModule(modId)
    if (lesson) {
      setActiveLesson(lesson.id)
      setLessonData({ title: lesson.title, video_url: lesson.video_url || '', content: lesson.content || '' })
    } else {
      setActiveLesson(null)
      setLessonData({ title: '', video_url: '', content: '' })
    }
    setIsLessonModalOpen(true)
  }

  async function saveLesson() {
    if (!lessonData.title.trim()) return
    setSaving(true)

    if (activeLesson) { // Edit
      await supabase.from('course_lessons').update({
        title: lessonData.title,
        video_url: lessonData.video_url,
        content: lessonData.content
      }).eq('id', activeLesson)
    } else { // Create
      const mod = modules.find(m => m.id === activeModule)
      await supabase.from('course_lessons').insert({
        module_id: activeModule,
        title: lessonData.title,
        video_url: lessonData.video_url,
        content: lessonData.content,
        order_index: mod?.course_lessons?.length || 0
      })
    }

    setIsLessonModalOpen(false)
    setActiveLesson(null)
    setActiveModule(null)
    setSaving(false)
    fetchCourseData()
  }

  async function deleteLesson(lessonId) {
    if (!confirm('Tem certeza?')) return
    await supabase.from('course_lessons').delete().eq('id', lessonId)
    fetchCourseData()
  }

  // --- MATERIAL ACTIONS ---
  async function attachMaterial() {
    if (!selectedMaterial) return
    setSaving(true)
    await supabase.from('course_materials').insert({
      course_id: courseId,
      material_id: selectedMaterial
    })
    setIsMaterialModalOpen(false)
    setSelectedMaterial('')
    setSaving(false)
    fetchCourseData()
  }

  async function detachMaterial(materialId) {
    if (!confirm('Tem certeza?')) return
    await supabase.from('course_materials').delete().eq('course_id', courseId).eq('material_id', materialId)
    fetchCourseData()
  }

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>

  const unassignedMaterials = allMaterials.filter(m => !courseMaterials.some(cm => cm.id === m.id))

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Editar Curso</h1>
          <p>Gerencie informações, módulos e aulas</p>
        </div>
        <button className="btn btn-secondary" onClick={() => router.push('/admin/cursos')}>
          <IconArrowLeft size={16} /> Voltar
        </button>
      </div>

      {feedback && (
        <div className={`form-feedback form-feedback-${feedback.type} mb-lg`}>
          {feedback.msg}
        </div>
      )}

      <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        
        {/* COLUNA ESQUERDA: INFOS BÁSICAS */}
        <div className="glass-card panel">
          <h3 className="mb-md">Informações Básicas</h3>
          <form onSubmit={saveBasicInfo}>
            <div className="form-group mb-md">
              <label className="form-label">Capa</label>
              <div className="file-upload mb-sm" onClick={() => coverInputRef.current?.click()} style={{ padding: '1rem' }}>
                <input ref={coverInputRef} type="file" accept=".jpg,.png,.webp" style={{ display: 'none' }} onChange={(e) => {
                  if (e.target.files[0]) setCoverFile(e.target.files[0])
                }} />
                {coverFile ? (
                  <img src={URL.createObjectURL(coverFile)} alt="Nova Capa" style={{ maxHeight: '100px', objectFit: 'contain' }} />
                ) : coverUrl ? (
                  <img src={coverUrl} alt="Capa" style={{ maxHeight: '100px', objectFit: 'contain' }} />
                ) : (
                  <><IconImage size={24} /> <span className="text-secondary mt-xs">Alterar Capa</span></>
                )}
              </div>
            </div>

            <div className="form-group mb-md">
              <label className="form-label">Título</label>
              <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className="form-group mb-md">
              <label className="form-label">Descrição</label>
              <textarea className="form-input form-textarea" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>

            <div className="form-group mb-md">
              <label className="form-label">Preço (R$)</label>
              <input type="number" step="0.01" min="0" className="form-input" value={price} onChange={e => setPrice(e.target.value)} />
            </div>

            <div className="form-group mb-md">
               <label className="checkbox-item" style={{ padding: 0 }}>
                 <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                 <span>Curso Ativo</span>
               </label>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={saving}>
              {saving ? <span className="spinner" /> : <><IconCheck size={16} /> Salvar Alterações</>}
            </button>
          </form>

          <hr className="my-lg" />
          
          <div className="flex items-center justify-between mb-md">
            <h3>Materiais Anexos</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsMaterialModalOpen(true)}>
              <IconPlus size={14} /> Adicionar
            </button>
          </div>
          {courseMaterials.length === 0 ? (
            <p className="text-tertiary" style={{ fontSize: '0.875rem' }}>Nenhum material anexado.</p>
          ) : (
            <div className="flex flex-col gap-sm">
              {courseMaterials.map(m => (
                <div key={m.id} className="flex items-center justify-between p-sm" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex items-center gap-xs">
                    <IconLink size={14} className="text-secondary" />
                    <span style={{ fontSize: '0.875rem' }}>{m.title}</span>
                  </div>
                  <button className="btn btn-ghost text-danger p-xs" onClick={() => detachMaterial(m.id)}>
                    <IconTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: MÓDULOS E AULAS */}
        <div className="glass-card panel">
          <div className="flex items-center justify-between mb-lg">
            <h3>Conteúdo do Curso</h3>
            <button className="btn btn-primary" onClick={() => { setActiveModule(null); setModuleTitleInput(''); setIsModuleModalOpen(true); }}>
              <IconPlus size={16} /> Novo Módulo
            </button>
          </div>

          {modules.length === 0 ? (
            <div className="empty-state p-xl" style={{ border: '1px dashed var(--border-subtle)' }}>
              <p className="text-secondary">Nenhum módulo criado ainda. Adicione o primeiro para começar a colocar aulas.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-lg">
              {modules.map(mod => (
                <div key={mod.id} className="module-card" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div className="module-header flex items-center justify-between p-md" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <h4 style={{ margin: 0 }}>{mod.title}</h4>
                    <div className="flex gap-sm">
                      <button className="btn btn-secondary btn-sm" onClick={() => { setActiveModule(mod); setModuleTitleInput(mod.title); setIsModuleModalOpen(true); }}>
                        <IconEdit size={14} /> Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteModule(mod.id)}>
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="module-lessons p-md" style={{ backgroundColor: 'var(--bg-app)' }}>
                    {mod.course_lessons?.length === 0 ? (
                      <p className="text-tertiary" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Nenhuma aula neste módulo.</p>
                    ) : (
                      <div className="flex flex-col gap-sm mb-md">
                        {mod.course_lessons.map(lesson => (
                          <div key={lesson.id} className="lesson-item flex items-center justify-between p-sm" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                            <div className="flex items-center gap-md">
                              <div className="badge badge-accent">Aula</div>
                              <span style={{ fontWeight: 500 }}>{lesson.title}</span>
                            </div>
                            <div className="flex gap-xs">
                              <button className="btn btn-ghost p-xs" onClick={() => openLessonModal(mod.id, lesson)}>
                                <IconEdit size={14} />
                              </button>
                              <button className="btn btn-ghost text-danger p-xs" onClick={() => deleteLesson(lesson.id)}>
                                <IconTrash size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <button className="btn btn-secondary btn-sm w-full" onClick={() => openLessonModal(mod.id)}>
                      <IconPlus size={14} /> Adicionar Aula
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {isModuleModalOpen && (
        <Modal title={activeModule ? 'Editar Módulo' : 'Novo Módulo'} onClose={() => setIsModuleModalOpen(false)}>
          <div className="form-group">
            <label className="form-label">Título do Módulo</label>
            <input type="text" className="form-input" value={moduleTitleInput} onChange={e => setModuleTitleInput(e.target.value)} placeholder="Ex: Módulo 1 - Introdução" />
          </div>
          <div className="flex justify-end gap-sm mt-md">
            <button className="btn btn-secondary" onClick={() => setIsModuleModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveModule} disabled={saving || !moduleTitleInput.trim()}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </Modal>
      )}

      {isLessonModalOpen && (
        <Modal title={activeLesson ? 'Editar Aula' : 'Nova Aula'} onClose={() => setIsLessonModalOpen(false)} maxWidth="600px">
          <div className="form-group mb-md">
            <label className="form-label">Título da Aula *</label>
            <input type="text" className="form-input" value={lessonData.title} onChange={e => setLessonData({...lessonData, title: e.target.value})} />
          </div>
          <div className="form-group mb-md">
            <label className="form-label">Link do Vídeo (YouTube)</label>
            <input type="url" className="form-input" value={lessonData.video_url} onChange={e => setLessonData({...lessonData, video_url: e.target.value})} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div className="form-group">
            <label className="form-label">Texto de Apoio (Opcional)</label>
            <textarea className="form-input form-textarea" value={lessonData.content} onChange={e => setLessonData({...lessonData, content: e.target.value})} rows={5} placeholder="Pode conter links, instruções complementares, etc." />
          </div>
          <div className="flex justify-end gap-sm mt-md">
            <button className="btn btn-secondary" onClick={() => setIsLessonModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveLesson} disabled={saving || !lessonData.title.trim()}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </Modal>
      )}

      {isMaterialModalOpen && (
        <Modal title="Anexar Material" onClose={() => setIsMaterialModalOpen(false)}>
          <div className="form-group">
            <label className="form-label">Selecione o Material</label>
            <select className="form-input" value={selectedMaterial} onChange={e => setSelectedMaterial(e.target.value)}>
              <option value="">-- Selecione --</option>
              {unassignedMaterials.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
            {unassignedMaterials.length === 0 && (
              <p className="text-secondary mt-xs" style={{ fontSize: '0.8rem' }}>Todos os materiais disponíveis já estão anexados ou não há materiais cadastrados.</p>
            )}
          </div>
          <div className="flex justify-end gap-sm mt-md">
            <button className="btn btn-secondary" onClick={() => setIsMaterialModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={attachMaterial} disabled={saving || !selectedMaterial}>{saving ? 'Anexando...' : 'Anexar'}</button>
          </div>
        </Modal>
      )}
    </>
  )
}
