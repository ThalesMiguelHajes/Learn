'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BUCKETS, MAX_FILE_SIZE, ACCEPTED_COVER_TYPES } from '@/lib/constants'
import { IconImage, IconX, IconDashboard } from '@/components/icons'

export default function NovoCursoPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const coverInputRef = useRef(null)
  const supabase = createClient()
  const router = useRouter()

  function handleCoverSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_COVER_TYPES.includes(file.type)) {
      setError('Formato de capa inválido. Use JPG, PNG ou WebP.')
      return
    }
    if (file.size > MAX_FILE_SIZE.COVER) {
      setError('A imagem de capa deve ter no máximo 5MB.')
      return
    }

    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
    setError('')
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!coverFile) {
      setError('Selecione uma imagem de capa.')
      return
    }

    setLoading(true)

    try {
      const timestamp = Date.now()
      const coverExt = coverFile.name.split('.').pop()
      const coverPath = `${timestamp}-${Math.random().toString(36).substring(7)}.${coverExt}`

      // Upload cover
      const { error: coverError } = await supabase.storage
        .from(BUCKETS.COVERS)
        .upload(coverPath, coverFile)

      if (coverError) throw new Error('Erro ao enviar capa: ' + coverError.message)

      // Get public URL for cover
      const { data: coverUrlData } = supabase.storage
        .from(BUCKETS.COVERS)
        .getPublicUrl(coverPath)

      // Insert course record
      const { data: course, error: dbError } = await supabase.from('courses').insert({
        title,
        description,
        price: parseFloat(price) || 0,
        cover_url: coverUrlData.publicUrl,
        is_active: isActive,
      }).select().single()

      if (dbError) throw new Error('Erro ao salvar: ' + dbError.message)

      // Go straight to edit page to add modules/lessons/materials
      router.push(`/admin/cursos/${course.id}/editar`)
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Novo Curso</h1>
          <p>Crie um novo curso em vídeo</p>
        </div>
      </div>

      <div className="glass-card form-panel">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="form-feedback form-feedback-error mb-lg" style={{ textAlign: 'left', borderLeft: '3px solid var(--error)' }}>
              {error}
            </div>
          )}

          <div className="form-group mb-lg">
            <label htmlFor="title" className="form-label">Título *</label>
            <input
              id="title"
              type="text"
              className="form-input"
              placeholder="Nome do curso"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-lg">
            <label htmlFor="description" className="form-label">Descrição</label>
            <textarea
              id="description"
              className="form-input form-textarea"
              placeholder="Descreva o conteúdo do curso..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group mb-lg">
            <label htmlFor="price" className="form-label">Preço (R$)</label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ maxWidth: '200px' }}
            />
          </div>

          <div className="form-group mb-lg">
            <label className="form-label">Imagem de Capa *</label>
            <div className="file-upload" onClick={() => coverInputRef.current?.click()}>
              <input
                ref={coverInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleCoverSelect}
                style={{ display: 'none' }}
              />
              <div className="upload-icon"><IconImage size={32} /></div>
              <div className="upload-text">
                Clique para selecionar ou <strong>arraste a imagem</strong>
              </div>
              <div className="upload-hint">JPG, PNG ou WebP — Máx. 5MB</div>
            </div>
            {coverPreview && (
              <div className="file-preview">
                <img src={coverPreview} alt="Preview" className="file-preview-image" />
                <div className="file-preview-info">
                  <div className="file-preview-name">{coverFile?.name}</div>
                  <div className="file-preview-size">{formatFileSize(coverFile?.size)}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                >
                  <IconX size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="form-group mb-xl">
            <label className="checkbox-item" style={{ padding: 0 }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span>Curso ativo (visível para clientes atribuídos e na loja)</span>
            </label>
          </div>

          <div className="flex gap-md">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? <><span className="spinner" /> Salvando...</> : <><IconDashboard size={16} /> Criar Curso</>}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => router.push('/admin/cursos')}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
