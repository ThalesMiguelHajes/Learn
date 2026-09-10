'use client'

import { useState, useEffect, useRef, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BUCKETS, MAX_FILE_SIZE, ACCEPTED_COVER_TYPES, ACCEPTED_MATERIAL_TYPES } from '@/lib/constants'
import { IconFileText, IconCheckCircle } from '@/components/icons'

export default function EditarEbookPage({ params }) {
  const { id } = use(params)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [ebookFile, setEbookFile] = useState(null)
  const [existingFile, setExistingFile] = useState(null)
  const [existingCover, setExistingCover] = useState(null)
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const coverInputRef = useRef(null)
  const ebookInputRef = useRef(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchEbook() {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('Material não encontrado.')
        setFetching(false)
        return
      }

      setTitle(data.title)
      setDescription(data.description || '')
      setPrice(data.price?.toString() || '')
      setIsActive(data.is_active)
      setExistingCover(data.cover_url)
      setCoverPreview(data.cover_url)
      setExistingFile({ name: data.file_name, path: data.file_path, type: data.material_type })
      setFetching(false)
    }

    fetchEbook()
  }, [id])

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

  function handleEbookSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ACCEPTED_MATERIAL_TYPES.includes(file.type)) {
      setError('Formato inválido. Use PDF ou ZIP.')
      return
    }
    if (file.size > MAX_FILE_SIZE.MATERIAL) {
      setError('O arquivo deve ter no máximo 50MB.')
      return
    }
    setEbookFile(file)
    setError('')
  }

  function formatFileSize(bytes) {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const updates = {
        title,
        description,
        price: parseFloat(price) || 0,
        is_active: isActive,
      }

      // Upload new cover if changed
      if (coverFile) {
        // Delete old cover
        if (existingCover) {
          try {
            const url = new URL(existingCover)
            const path = url.pathname.split('/covers/')[1]
            if (path) await supabase.storage.from(BUCKETS.COVERS).remove([decodeURIComponent(path)])
          } catch {}
        }

        const timestamp = Date.now()
        const ext = coverFile.name.split('.').pop()
        const coverPath = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`

        const { error: coverError } = await supabase.storage
          .from(BUCKETS.COVERS)
          .upload(coverPath, coverFile)
        if (coverError) throw new Error('Erro ao enviar capa: ' + coverError.message)

        const { data: coverUrlData } = supabase.storage.from(BUCKETS.COVERS).getPublicUrl(coverPath)
        updates.cover_url = coverUrlData.publicUrl
      }

      // Upload new ebook file if changed
      if (ebookFile) {
        // Delete old file
        if (existingFile?.path) {
          await supabase.storage.from(BUCKETS.MATERIALS).remove([existingFile.path])
        }

        const timestamp = Date.now()
        const ext = ebookFile.name.split('.').pop()
        const ebookPath = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`

        const { error: ebookError } = await supabase.storage
          .from(BUCKETS.MATERIALS)
          .upload(ebookPath, ebookFile)
        if (ebookError) throw new Error('Erro ao enviar arquivo: ' + ebookError.message)

        updates.file_path = ebookPath
        updates.file_name = ebookFile.name
        updates.material_type = ext.toLowerCase() === 'zip' ? 'zip' : 'pdf'
      }

      const { error: dbError } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', id)

      if (dbError) throw new Error('Erro ao atualizar: ' + dbError.message)

      router.push('/admin/materiais')
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg" />
        <p>Carregando material...</p>
      </div>
    )
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Editar Material</h1>
          <p>Atualize as informações do material</p>
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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ maxWidth: '200px' }}
            />
          </div>

          <div className="form-group mb-lg">
            <label className="form-label">Imagem de Capa</label>
            {coverPreview && (
              <div className="file-preview mb-md">
                <img src={coverPreview} alt="Capa atual" className="file-preview-image" />
                <div className="file-preview-info">
                  <div className="file-preview-name">{coverFile ? coverFile.name : 'Capa atual'}</div>
                  {coverFile && <div className="file-preview-size">{formatFileSize(coverFile.size)}</div>}
                </div>
              </div>
            )}
            <div className="file-upload" onClick={() => coverInputRef.current?.click()}>
              <input
                ref={coverInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleCoverSelect}
                style={{ display: 'none' }}
              />
              <div className="upload-text">
                <strong>Clique para trocar a capa</strong>
              </div>
              <div className="upload-hint">JPG, PNG ou WebP — Máx. 5MB</div>
            </div>
          </div>

          <div className="form-group mb-lg">
            <label className="form-label">Arquivo do Material</label>
            {(existingFile || ebookFile) && (
              <div className="file-preview mb-md">
                <div className="file-preview-image flex items-center justify-center">
                  <IconFileText size={24} />
                </div>
                <div className="file-preview-info">
                  <div className="file-preview-name">{ebookFile ? ebookFile.name : existingFile?.name}</div>
                  {ebookFile && <div className="file-preview-size">{formatFileSize(ebookFile.size)}</div>}
                  {!ebookFile && existingFile && (
                    <div className="file-preview-size">
                      <span className="badge badge-info">{existingFile.type?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="file-upload" onClick={() => ebookInputRef.current?.click()}>
              <input
                ref={ebookInputRef}
                type="file"
                accept=".pdf,.zip"
                onChange={handleEbookSelect}
                style={{ display: 'none' }}
              />
              <div className="upload-text">
                <strong>Clique para trocar o arquivo</strong>
              </div>
              <div className="upload-hint">PDF ou ZIP — Máx. 50MB</div>
            </div>
          </div>

          <div className="form-group mb-xl">
            <label className="checkbox-item" style={{ padding: 0 }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span>Material ativo</span>
            </label>
          </div>

          <div className="flex gap-md">
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" /> Salvando...</> : <><IconCheckCircle size={16} /> Salvar alterações</>}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => router.push('/admin/materiais')}
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
