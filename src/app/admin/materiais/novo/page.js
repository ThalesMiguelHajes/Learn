'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BUCKETS, MAX_FILE_SIZE, ACCEPTED_COVER_TYPES, ACCEPTED_MATERIAL_TYPES } from '@/lib/constants'
import { IconImage, IconFileText, IconX, IconBooks } from '@/components/icons'

export default function NovoEbookPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [materialType, setMaterialType] = useState('pdf') // 'pdf', 'zip', 'html_slides'
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  
  // ebookFile can be a single File (PDF/ZIP) or an array of Files (HTML Slides folder)
  const [ebookFile, setEbookFile] = useState(null) 
  const [previewHtml, setPreviewHtml] = useState(null)
  
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const coverInputRef = useRef(null)
  const ebookInputRef = useRef(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (materialType === 'html_slides' && Array.isArray(ebookFile) && ebookFile.length > 0) {
      const indexFile = ebookFile.find(f => f.name === 'index.html' || (f.webkitRelativePath && f.webkitRelativePath.endsWith('index.html')))
      
      if (!indexFile) {
        setPreviewHtml('<div style="font-family:sans-serif;padding:2rem;text-align:center;color:#ef4444;">⚠️ Arquivo index.html não encontrado na raiz da pasta. Verifique a exportação.</div>')
        return
      }

      const buildPreview = async () => {
        try {
          let html = await indexFile.text()
          
          const urlMap = {}
          for (const f of ebookFile) {
            if (f === indexFile) continue
            // Pega o caminho relativo ignorando a primeira pasta (raiz)
            const parts = f.webkitRelativePath.split('/')
            parts.shift()
            const relativePath = parts.join('/')
            urlMap[relativePath] = URL.createObjectURL(f)
            urlMap['./' + relativePath] = urlMap[relativePath]
          }

          // Substitui caminhos de href e src pelo ObjectURL carregado
          html = html.replace(/(href|src)=["'](.*?)["']/g, (match, p1, p2) => {
            const cleanPath = p2.replace(/^\.\//, '').replace(/^(\.\.\/)+/, '')
            const matchedKey = Object.keys(urlMap).find(k => k.endsWith(cleanPath))
            if (matchedKey) {
              return `${p1}="${urlMap[matchedKey]}"`
            }
            return match
          })
          
          setPreviewHtml(html)
        } catch (e) {
          console.error(e)
          setPreviewHtml('<div style="font-family:sans-serif;padding:2rem;text-align:center;color:#ef4444;">Erro ao processar o preview.</div>')
        }
      }
      
      buildPreview()
    } else {
      setPreviewHtml(null)
    }
  }, [ebookFile, materialType])

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
    const files = e.target.files
    if (!files || files.length === 0) return

    if (materialType === 'html_slides') {
      // For folders, we get multiple files
      const fileArray = Array.from(files)
      // We could add size checks here if needed
      setEbookFile(fileArray)
    } else {
      // For single files (PDF / ZIP)
      const file = files[0]
      if (!ACCEPTED_MATERIAL_TYPES.includes(file.type)) {
        setError('Formato de arquivo inválido. Use PDF ou ZIP.')
        return
      }
      if (file.size > MAX_FILE_SIZE.MATERIAL) {
        setError('O arquivo do material deve ter no máximo 50MB.')
        return
      }
      setEbookFile(file)
    }
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
    if (!ebookFile || (Array.isArray(ebookFile) && ebookFile.length === 0)) {
      setError('Selecione o arquivo ou pasta do material.')
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

      let finalFilePath = ''

      if (materialType === 'html_slides') {
        // Upload folder
        const folderName = `${timestamp}-${Math.random().toString(36).substring(7)}/slides`
        finalFilePath = folderName
        
        // Upload files in batches of 20 to speed up without hitting connection limits
        const CONCURRENT_UPLOADS = 20
        for (let i = 0; i < ebookFile.length; i += CONCURRENT_UPLOADS) {
          const batch = Array.from(ebookFile).slice(i, i + CONCURRENT_UPLOADS)
          
          await Promise.all(batch.map(async (file) => {
            const relativePathParts = file.webkitRelativePath.split('/')
            relativePathParts.shift() // remove top folder
            const safeRelativePath = relativePathParts.join('/') || file.name
            
            const filePath = `${folderName}/${safeRelativePath}`
            
            const { error: fileError } = await supabase.storage
              .from(BUCKETS.MATERIALS)
              .upload(filePath, file)
              
            if (fileError) throw new Error(`Erro ao enviar arquivo ${file.name}: ` + fileError.message)
          }))
        }
        
      } else {
        // Upload single file (PDF/ZIP)
        const ebookExt = ebookFile.name.split('.').pop()
        finalFilePath = `${timestamp}-${Math.random().toString(36).substring(7)}.${ebookExt}`

        const { error: ebookError } = await supabase.storage
          .from(BUCKETS.MATERIALS)
          .upload(finalFilePath, ebookFile)

        if (ebookError) throw new Error('Erro ao enviar arquivo: ' + ebookError.message)
      }

      // Insert material record (removed file_name which doesn't exist)
      const { error: dbError } = await supabase.from('materials').insert({
        title,
        description,
        price: parseFloat(price) || 0,
        cover_url: coverUrlData.publicUrl,
        file_path: finalFilePath,
        material_type: materialType,
        is_active: isActive,
      })

      if (dbError) throw new Error('Erro ao salvar no banco: ' + dbError.message)

      router.push('/admin/materiais')
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Reset file selection when changing material type
  const handleTypeChange = (e) => {
    setMaterialType(e.target.value)
    setEbookFile(null)
    if (ebookInputRef.current) ebookInputRef.current.value = ''
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Novo Material</h1>
          <p>Adicione um novo livro digital ou slides à plataforma</p>
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
            <label htmlFor="materialType" className="form-label">Tipo de Material *</label>
            <select 
              id="materialType" 
              className="form-input" 
              value={materialType} 
              onChange={handleTypeChange}
              style={{ maxWidth: '200px' }}
            >
              <option value="pdf">PDF</option>
              <option value="zip">Arquivo ZIP</option>
              <option value="html_slides">Slides</option>
            </select>
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
            <label className="form-label">
              {materialType === 'html_slides' ? 'Pasta do Material (HTML/CSS/JS) *' : 'Arquivo do Material *'}
            </label>
            <div className="file-upload" onClick={() => ebookInputRef.current?.click()}>
              {materialType === 'html_slides' ? (
                <input
                  ref={ebookInputRef}
                  type="file"
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  onChange={handleEbookSelect}
                  style={{ display: 'none' }}
                />
              ) : (
                <input
                  ref={ebookInputRef}
                  type="file"
                  accept=".pdf,.zip"
                  onChange={handleEbookSelect}
                  style={{ display: 'none' }}
                />
              )}
              
              <div className="upload-icon"><IconFileText size={32} /></div>
              <div className="upload-text">
                Clique para selecionar {materialType === 'html_slides' ? 'uma pasta' : 'ou arraste o arquivo'}
              </div>
              <div className="upload-hint">
                {materialType === 'html_slides' ? 'Selecione a pasta raiz contendo o index.html' : 'PDF ou ZIP — Máx. 50MB'}
              </div>
            </div>
            
            {ebookFile && (
              <div className="file-preview">
                <div className="file-preview-image flex items-center justify-center">
                  <IconFileText size={24} />
                </div>
                <div className="file-preview-info">
                  {materialType === 'html_slides' ? (
                    <>
                      <div className="file-preview-name">{ebookFile.length} arquivos selecionados</div>
                      <div className="file-preview-size">
                        Pasta pronta para envio
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="file-preview-name">{ebookFile.name}</div>
                      <div className="file-preview-size">{formatFileSize(ebookFile.size)}</div>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setEbookFile(null)
                    if (ebookInputRef.current) ebookInputRef.current.value = ''
                  }}
                >
                  <IconX size={16} />
                </button>
              </div>
            )}

            {previewHtml && (
              <div style={{ marginTop: '1rem', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'var(--surface-light)', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
                  Pré-visualização da Aula HTML
                </div>
                <iframe 
                  srcDoc={previewHtml} 
                  style={{ width: '100%', height: '400px', border: 'none', backgroundColor: '#fff' }}
                  title="Preview"
                />
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
