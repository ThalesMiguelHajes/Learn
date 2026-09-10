'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconArrowLeft, IconPlay, IconLink, IconBookOpen, IconLock } from '@/components/icons'
import Image from 'next/image'

export default function PlayerClient({ course, modules, materials }) {
  const [activeLesson, setActiveLesson] = useState(
    modules.length > 0 && modules[0].course_lessons?.length > 0
      ? modules[0].course_lessons[0]
      : null
  )

  function getYoutubeEmbedUrl(url) {
    if (!url) return null
    try {
      let videoId = ''
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0]
      } else if (url.includes('youtube.com/watch')) {
        videoId = new URL(url).searchParams.get('v')
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : null
    } catch (e) {
      return null
    }
  }

  const embedUrl = activeLesson ? getYoutubeEmbedUrl(activeLesson.video_url) : null

  return (
    <div className="course-player-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-md)', minHeight: 'calc(100vh - 120px)' }}>
      {/* MAIN CONTENT AREA */}
      <div className="player-main" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="flex items-center gap-sm">
          <Link href="/biblioteca?tab=cursos" className="btn btn-ghost text-secondary" style={{ padding: '0.25rem 0.5rem' }}>
            <IconArrowLeft size={16} /> Voltar
          </Link>
          <span className="text-tertiary">/</span>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{course.title}</h2>
        </div>

        {activeLesson ? (
          <div className="glass-card panel" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Video Player */}
            {embedUrl ? (
              <div className="video-wrapper" style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={embedUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              </div>
            ) : (
              <div className="video-placeholder" style={{ background: '#000', padding: '15%', textAlign: 'center', color: '#fff' }}>
                <IconPlay size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <p>Nenhum vídeo disponível para esta aula.</p>
              </div>
            )}

            {/* Lesson Content */}
            <div className="lesson-content p-xl">
              <h1 className="mb-md">{activeLesson.title}</h1>
              {activeLesson.content && (
                <div 
                  className="lesson-text" 
                  style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}
                  dangerouslySetInnerHTML={{ __html: activeLesson.content.replace(/\n/g, '<br/>') }} 
                />
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card panel p-xl text-center flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
            <IconLock size={48} className="text-tertiary mb-md" />
            <h3>Nenhuma aula selecionada</h3>
            <p className="text-secondary">Escolha uma aula no menu lateral para começar.</p>
          </div>
        )}
      </div>

      {/* SIDEBAR AREA */}
      <div className="player-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        
        {/* Module List */}
        <div className="glass-card panel" style={{ padding: 'var(--space-md)', flex: 1, overflowY: 'auto' }}>
          <h3 className="mb-md" style={{ fontSize: '1.125rem' }}>Conteúdo</h3>
          {modules.length === 0 ? (
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Este curso ainda não possui módulos.</p>
          ) : (
            <div className="modules-list flex flex-col gap-sm">
              {modules.map(mod => (
                <div key={mod.id} className="module-item">
                  <div className="module-title font-semibold mb-xs" style={{ fontSize: '0.9375rem' }}>
                    {mod.title}
                  </div>
                  <div className="lessons-list flex flex-col gap-xs ml-sm" style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 'var(--space-sm)' }}>
                    {mod.course_lessons?.length === 0 ? (
                      <span className="text-tertiary" style={{ fontSize: '0.8rem' }}>Sem aulas</span>
                    ) : (
                      mod.course_lessons.map(lesson => {
                        const isActive = activeLesson?.id === lesson.id
                        return (
                          <button
                            key={lesson.id}
                            className={`btn btn-ghost text-left w-full ${isActive ? 'text-primary font-semibold' : 'text-secondary'}`}
                            style={{ 
                              padding: '0.375rem 0.5rem', 
                              fontSize: '0.875rem',
                              backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
                              borderRadius: 'var(--radius-sm)'
                            }}
                            onClick={() => setActiveLesson(lesson)}
                          >
                            <IconPlay size={12} className="mr-xs" style={{ display: 'inline-block', opacity: isActive ? 1 : 0.5 }} /> 
                            {lesson.title}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Materials List */}
        {materials.length > 0 && (
          <div className="glass-card panel" style={{ padding: 'var(--space-md)' }}>
            <h3 className="mb-md" style={{ fontSize: '1.125rem' }}>Materiais Anexos</h3>
            <div className="flex flex-col gap-sm">
              {materials.map(mat => (
                <Link
                  key={mat.id}
                  href={`/biblioteca/material/${mat.id}`}
                  className="flex items-center gap-sm p-sm"
                  style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'inherit' }}
                >
                  {mat.cover_url ? (
                    <Image src={mat.cover_url} alt="" width={32} height={32} style={{ borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                  ) : (
                    <div className="flex items-center justify-center" style={{ width: 32, height: 32, backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                      <IconBookOpen size={16} className="text-secondary" />
                    </div>
                  )}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{mat.title}</div>
                    <div className="text-tertiary" style={{ fontSize: '0.75rem' }}>
                      {mat.material_type?.toUpperCase()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
