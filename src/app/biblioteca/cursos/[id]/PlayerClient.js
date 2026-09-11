'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  IconArrowLeft,
  IconArrowRight,
  IconPlay,
  IconBookOpen,
  IconLock,
  IconCheckCircle,
  IconCircle,
  IconChevronDown,
  IconChevronUp,
  IconFileText,
  IconDownload
} from '@/components/icons'

export default function PlayerClient({ course, modules = [], materials = [] }) {
  // Lista linear de todas as aulas para navegação sequencial
  const allLessons = useMemo(() => {
    return modules.flatMap(mod => 
      (mod.course_lessons || []).map(lesson => ({
        ...lesson,
        moduleTitle: mod.title,
        moduleId: mod.id
      }))
    )
  }, [modules])

  // Aula selecionada atualmente
  const [activeLesson, setActiveLesson] = useState(
    allLessons.length > 0 ? allLessons[0] : null
  )

  // Módulos abertos no acordeom
  const [openModuleIds, setOpenModuleIds] = useState(() => {
    if (modules.length > 0) {
      return [modules[0].id]
    }
    return []
  })

  // Aulas concluídas salvas no localStorage
  const [completedLessonIds, setCompletedLessonIds] = useState([])
  const [activeTab, setActiveTab] = useState('description')

  // Carregar progresso do localStorage
  useEffect(() => {
    if (!course?.id) return
    try {
      const saved = localStorage.getItem(`learn_course_completed_${course.id}`)
      if (saved) {
        setCompletedLessonIds(JSON.parse(saved))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [course?.id])

  // Salvar progresso no localStorage
  function toggleCompleteLesson(lessonId) {
    if (!lessonId) return
    setCompletedLessonIds(prev => {
      const next = prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]

      try {
        localStorage.setItem(`learn_course_completed_${course.id}`, JSON.stringify(next))
      } catch {
        // Ignore localStorage errors
      }
      return next
    })
  }

  // Alternar acordeom de módulo
  function toggleModule(modId) {
    setOpenModuleIds(prev =>
      prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
    )
  }

  // Selecionar aula e garantir que seu módulo esteja aberto
  function handleSelectLesson(lesson, moduleId) {
    setActiveLesson(lesson)
    if (moduleId && !openModuleIds.includes(moduleId)) {
      setOpenModuleIds(prev => [...prev, moduleId])
    }
    // Rolar suavemente para o topo do vídeo se estiver no mobile
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Navegação anterior / próxima
  const currentIndex = allLessons.findIndex(l => l.id === activeLesson?.id)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  // Módulo atual
  const currentModule = modules.find(m => 
    m.id === activeLesson?.moduleId || m.course_lessons?.some(l => l.id === activeLesson?.id)
  )

  // Estatísticas de progresso
  const totalLessons = allLessons.length
  const completedCount = allLessons.filter(l => completedLessonIds.includes(l.id)).length
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const isCurrentLessonCompleted = activeLesson ? completedLessonIds.includes(activeLesson.id) : false

  // Helper para URL de Embed do YouTube
  function getYoutubeEmbedUrl(url) {
    if (!url) return null
    try {
      let videoId = ''
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0]
      } else if (url.includes('youtube.com/watch')) {
        videoId = new URL(url).searchParams.get('v')
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1].split('?')[0]
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1` : null
    } catch {
      return null
    }
  }

  const embedUrl = activeLesson ? getYoutubeEmbedUrl(activeLesson.video_url) : null

  return (
    <div className="course-player-container">
      {/* Top Header Bar */}
      <div className="course-player-header">
        <div className="flex items-center gap-sm flex-wrap">
          <Link href="/biblioteca?tab=cursos" className="btn btn-secondary btn-sm gap-xs">
            <IconArrowLeft size={16} /> Voltar para Meus Cursos
          </Link>
          <span className="text-tertiary">/</span>
          <span className="badge badge-accent" style={{ fontSize: '0.75rem' }}>CURSO</span>
          <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>{course.title}</h2>
        </div>

        <div className="flex items-center gap-sm">
          <span className="text-tertiary" style={{ fontSize: '0.85rem' }}>
            {modules.length} {modules.length === 1 ? 'módulo' : 'módulos'} • {totalLessons} {totalLessons === 1 ? 'aula' : 'aulas'}
          </span>
          <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
            {progressPercent}% Concluído
          </span>
        </div>
      </div>

      {/* Main Grid: Player on left, Curriculum on right */}
      <div className="course-player-grid">
        {/* LEFT: Video Player, Controls & Info */}
        <div className="player-main-column">
          {activeLesson ? (
            <>
              {/* Video Player Card */}
              <div className="player-video-card">
                {embedUrl ? (
                  <div className="player-video-wrapper">
                    <iframe
                      src={embedUrl}
                      title={activeLesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="player-video-iframe"
                    />
                  </div>
                ) : (
                  <div className="player-video-placeholder">
                    <IconPlay size={48} style={{ opacity: 0.4, marginBottom: '1rem', color: 'var(--accent-primary)' }} />
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Vídeo não disponível</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', margin: 0 }}>
                      O instrutor ainda não anexou o link de vídeo desta aula.
                    </p>
                  </div>
                )}
              </div>

              {/* Sub-Player Controls Bar */}
              <div className="player-controls-bar">
                <div className="player-controls-meta">
                  <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                    Aula {currentIndex + 1} de {totalLessons}
                  </span>
                  {currentModule && (
                    <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
                      {currentModule.title}
                    </span>
                  )}
                </div>

                <div className="player-controls-actions">
                  <button
                    onClick={() => prevLesson && handleSelectLesson(prevLesson, prevLesson.moduleId)}
                    disabled={!prevLesson}
                    className="btn btn-secondary btn-sm"
                    title={prevLesson ? `Ir para: ${prevLesson.title}` : 'Primeira aula do curso'}
                  >
                    <IconArrowLeft size={14} /> Aula Anterior
                  </button>

                  <button
                    onClick={() => toggleCompleteLesson(activeLesson.id)}
                    className={`btn-complete-lesson ${isCurrentLessonCompleted ? 'is-completed' : ''}`}
                    title={isCurrentLessonCompleted ? 'Desmarcar como concluída' : 'Marcar como concluída'}
                  >
                    <IconCheckCircle size={16} />
                    {isCurrentLessonCompleted ? 'Aula Concluída' : 'Marcar como Concluída'}
                  </button>

                  <button
                    onClick={() => nextLesson && handleSelectLesson(nextLesson, nextLesson.moduleId)}
                    disabled={!nextLesson}
                    className="btn btn-primary btn-sm"
                    title={nextLesson ? `Ir para: ${nextLesson.title}` : 'Última aula do curso'}
                  >
                    Próxima Aula <IconArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Lesson Details & Description Panel */}
              <div className="lesson-info-panel">
                <div className="lesson-info-header">
                  {currentModule && (
                    <div className="lesson-module-tag">
                      <IconBookOpen size={13} /> {currentModule.title}
                    </div>
                  )}
                  <h1 className="lesson-info-title">{activeLesson.title}</h1>
                </div>

                {/* Tabs */}
                <div className="lesson-tabs-nav">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`lesson-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                  >
                    <IconFileText size={16} /> Sobre a Aula
                  </button>
                  {materials.length > 0 && (
                    <button
                      onClick={() => setActiveTab('materials')}
                      className={`lesson-tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
                    >
                      <IconDownload size={16} /> Materiais Complementares ({materials.length})
                    </button>
                  )}
                </div>

                {/* Tab Content */}
                <div className="lesson-tab-body">
                  {activeTab === 'description' && (
                    <>
                      {activeLesson.content ? (
                        <div
                          className="lesson-description-text"
                          dangerouslySetInnerHTML={{
                            __html: activeLesson.content.replace(/\n/g, '<br/>')
                          }}
                        />
                      ) : (
                        <div className="lesson-empty-desc">
                          <IconFileText size={24} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                          <div>
                            <strong>Nenhuma anotação adicional</strong>
                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
                              Acompanhe os conceitos explicados no vídeo acima. Se surgirem dúvidas, revise os tópicos ou consulte os materiais anexos.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'materials' && (
                    <div className="flex flex-col gap-sm">
                      {materials.map(mat => (
                        <Link
                          key={mat.id}
                          href={`/biblioteca/material/${mat.id}`}
                          className="material-sidebar-link"
                          style={{ padding: 'var(--space-md)' }}
                        >
                          {mat.cover_url ? (
                            <Image
                              src={mat.cover_url}
                              alt=""
                              width={40}
                              height={40}
                              style={{ borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="flex items-center justify-center"
                              style={{ width: 40, height: 40, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}
                            >
                              <IconBookOpen size={20} className="text-secondary" />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                              {mat.title}
                            </div>
                            <div className="text-tertiary" style={{ fontSize: '0.78rem', marginTop: '2px' }}>
                              {mat.material_type?.toUpperCase() || 'MATERIAL DIGITAL'} • Acessar arquivo &rarr;
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card panel p-xl text-center flex flex-col items-center justify-center" style={{ minHeight: '450px' }}>
              <IconLock size={48} className="text-tertiary mb-md" />
              <h3>Nenhuma aula selecionada</h3>
              <p className="text-secondary">Escolha uma aula no menu lateral à direita para começar a assistir.</p>
            </div>
          )}
        </div>

        {/* RIGHT: Sidebar Course Content (Curriculum) */}
        <aside className="course-sidebar-panel">
          {/* Progress Header Box */}
          <div className="course-progress-box">
            <div className="course-progress-header">
              <h3 className="course-progress-title">
                <IconPlay size={16} style={{ color: 'var(--accent-secondary)' }} />
                Conteúdo do Curso
              </h3>
              <span className="course-progress-percent">{progressPercent}%</span>
            </div>

            <div className="course-progress-bar-track">
              <div
                className="course-progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="course-progress-caption">
              {completedCount} de {totalLessons} aulas concluídas
            </div>
          </div>

          {/* Scrollable Modules Accordion */}
          <div className="course-modules-scroll">
            {modules.length === 0 ? (
              <p className="text-secondary p-md" style={{ fontSize: '0.875rem' }}>
                Este curso ainda não possui módulos cadastrados.
              </p>
            ) : (
              modules.map((mod, modIdx) => {
                const isOpen = openModuleIds.includes(mod.id)
                const lessonsCount = mod.course_lessons?.length || 0
                const moduleLessons = mod.course_lessons || []
                const completedInModule = moduleLessons.filter(l => completedLessonIds.includes(l.id)).length

                return (
                  <div key={mod.id} className="module-card">
                    {/* Module Accordion Header Button */}
                    <button
                      type="button"
                      className="module-header-btn"
                      onClick={() => toggleModule(mod.id)}
                      aria-expanded={isOpen}
                    >
                      <div className="module-header-title-box">
                        <span className="module-tag-small">
                          Módulo {String(modIdx + 1).padStart(2, '0')}
                        </span>
                        <span className="module-title-text">{mod.title}</span>
                      </div>

                      <div className="module-meta-right">
                        <span className="module-count-badge">
                          {completedInModule}/{lessonsCount}
                        </span>
                        {isOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                      </div>
                    </button>

                    {/* Module Lessons List (Expanded) */}
                    {isOpen && (
                      <div className="module-lessons-container">
                        {moduleLessons.length === 0 ? (
                          <span className="text-tertiary p-xs" style={{ fontSize: '0.78rem' }}>
                            Nenhuma aula cadastrada neste módulo.
                          </span>
                        ) : (
                          moduleLessons.map((lesson, lessonIdx) => {
                            const isActive = activeLesson?.id === lesson.id
                            const isCompleted = completedLessonIds.includes(lesson.id)

                            return (
                              <button
                                key={lesson.id}
                                type="button"
                                onClick={() => handleSelectLesson(lesson, mod.id)}
                                className={`lesson-row-btn ${isActive ? 'active' : ''}`}
                                title={lesson.title}
                              >
                                {/* Completion / Status Icon */}
                                <span
                                  className="lesson-icon-state"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleCompleteLesson(lesson.id)
                                  }}
                                  title={isCompleted ? 'Concluída (clique para alternar)' : 'Pendente (clique para concluir)'}
                                >
                                  {isCompleted ? (
                                    <IconCheckCircle size={16} style={{ color: 'var(--success)' }} />
                                  ) : isActive ? (
                                    <IconPlay size={13} style={{ color: 'var(--accent-secondary)' }} />
                                  ) : (
                                    <IconCircle size={15} style={{ color: 'var(--text-tertiary)' }} />
                                  )}
                                </span>

                                {/* Title with index */}
                                <span className="lesson-title-truncate">
                                  <span style={{ opacity: 0.6, marginRight: '6px', fontSize: '0.75rem' }}>
                                    {lessonIdx + 1}.
                                  </span>
                                  {lesson.title}
                                </span>

                                {/* Active Badge */}
                                {isActive && (
                                  <span className="lesson-active-pill">Assistindo</span>
                                )}
                              </button>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Attached Materials Section at Bottom of Sidebar */}
          {materials.length > 0 && (
            <div className="course-materials-sidebar">
              <div className="materials-sidebar-title">
                <IconDownload size={14} />
                Materiais do Curso ({materials.length})
              </div>
              <div className="flex flex-col gap-xs">
                {materials.map(mat => (
                  <Link
                    key={mat.id}
                    href={`/biblioteca/material/${mat.id}`}
                    className="material-sidebar-link"
                    title={mat.title}
                  >
                    <IconBookOpen size={15} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                      {mat.title}
                    </span>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                      {mat.material_type?.toUpperCase() || 'ARQUIVO'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
