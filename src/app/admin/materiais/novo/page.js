'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BUCKETS, MAX_FILE_SIZE, ACCEPTED_COVER_TYPES, ACCEPTED_MATERIAL_TYPES } from '@/lib/constants'
import { IconImage, IconFileText, IconX, IconBooks } from '@/components/icons'

export default function NovoEbookPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [ebookFile, setEbookFile] = useState(null)
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const coverInputRef = useRef(null)
  const ebookInputRef = useRef(null)
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

  function handleEbookSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_MATERIAL_TYPES.includes(file.type)) {
      setError('Formato de arquivo inválido. Use PDF ou ZIP.')
      return
    }
    if (file.size > MAX_FILE_SIZE.MATERIAL) {
      setError('O arquivo do material deve ter no máximo 50MB.')
      return
    }

    setEbookFile(file)
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
    if (!ebookFile) {
      setError('Selecione o arquivo do material (PDF ou ZIP).')
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

      // Upload ebook file
      const ebookExt = ebookFile.name.split('.').pop()
      const ebookPath = `${timestamp}-${Math.random().toString(36).substring(7)}.${ebookExt}`

      const { error: ebookError } = await supabase.storage
        .from(BUCKETS.MATERIALS)
        .upload(ebookPath, ebookFile)

      if (ebookError) throw new Error('Erro ao enviar arquivo: ' + ebookError.message)

      // Insert ebook record
      const { error: dbError } = await supabase.from('materials').insert({
        title,
        description,
        price: parseFloat(price) || 0,
        cover_url: coverUrlData.publicUrl,
        file_path: ebookPath,
        file_name: ebookFile.name,
        material_type: ebookExt.toLowerCase() === 'zip' ? 'zip' : 'pdf',
        is_active: isActive,
      })

      if (dbError) throw new Error('Erro ao salvar: ' + dbError.message)

      router.push('/admin/materiais')
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
          <h1>Novo Material</h1>
          <p>Adicione um novo livro digital à plataforma</p>
        </div>
      </div>

      <div className="glass-card form-panel">
        <form onSubmit={handleSubmit} id="ebook-form">
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
              placeholder="Nome do material"
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
              placeholder="Descreva o conteúdo do material..."
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

          <div className="form-group mb-lg">
            <label className="form-label">Arquivo do Material (PDF / ePub) *</label>
            <div className="file-upload" onClick={() => ebookInputRef.current?.click()}>
              <input
                ref={ebookInputRef}
                type="file"
                accept=".pdf,.zip"
                onChange={handleEbookSelect}
                style={{ display: 'none' }}
              />
              <div className="upload-icon"><IconFileText size={32} /></div>
              <div className="upload-text">
                Clique para selecionar ou <strong>arraste o arquivo</strong>
              </div>
              <div className="upload-hint">PDF ou ZIP — Máx. 50MB</div>
            </div>
            {ebookFile && (
              <div className="file-preview">
                <div className="file-preview-image flex items-center justify-center">
                  <IconFileText size={24} />
                </div>
                <div className="file-preview-info">
                  <div className="file-preview-name">{ebookFile.name}</div>
                  <div className="file-preview-size">{formatFileSize(ebookFile.size)}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEbookFile(null)}
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
              <span>Material ativo (visível para clientes atribuídos)</span>
            </label>
          </div>

          <div className="flex gap-md">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              id="ebook-submit"
            >
              {loading ? <><span className="spinner" /> Salvando...</> : <><IconBooks size={16} /> Criar Material</>}
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
