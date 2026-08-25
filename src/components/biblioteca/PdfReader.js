'use client'

import { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Configure worker from CDN to avoid webpack setup issues
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function PdfReader({ ebookId }) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [blobUrl, setBlobUrl] = useState(null)
  const [error, setError] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    async function fetchPdf() {
      try {
        const response = await fetch(`/api/download/${ebookId}`)
        if (!response.ok) throw new Error('Não foi possível carregar o arquivo.')
        
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setBlobUrl(url)
      } catch (err) {
        setError(err.message)
      }
    }
    fetchPdf()
    
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [ebookId])

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
    setPageNumber(1)
  }

  function changePage(offset) {
    setPageNumber((prevPageNumber) => {
      const newPage = prevPageNumber + offset
      if (newPage >= 1 && newPage <= (numPages || 1)) return newPage
      return prevPageNumber
    })
  }

  function previousPage() { changePage(-1) }
  function nextPage() { changePage(1) }
  function zoomIn() { setScale((prev) => Math.min(prev + 0.5, 3.0)) }
  function zoomOut() { setScale((prev) => Math.max(prev - 0.5, 0.5)) }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      }
    }
  }

  useEffect(() => {
    function handleFullscreenChange() { setIsFullscreen(!!document.fullscreenElement) }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (error) {
    return <div className="pdf-error"><p>{error}</p></div>
  }

  return (
    <div className={`pdf-reader-container ${isFullscreen ? 'fullscreen' : ''}`} ref={containerRef}>
      <div className="pdf-reader-toolbar">
        <div className="toolbar-group">
          <button className="btn-icon" onClick={zoomOut} title="Diminuir Zoom">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </button>
          <span className="scale-indicator">{Math.round(scale * 100)}%</span>
          <button className="btn-icon" onClick={zoomIn} title="Aumentar Zoom">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </button>
        </div>

        <div className="toolbar-group pagination-group">
          <span className="page-indicator">
            {numPages ? `${numPages} páginas` : '--'}
          </span>
        </div>

        <div className="toolbar-group">
          <button className="btn-icon" onClick={toggleFullscreen} title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}>
            {isFullscreen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            )}
          </button>
        </div>
      </div>

      <div className="pdf-reader-document">
        {!blobUrl ? (
          <div className="pdf-loading">
            <span className="spinner spinner-lg"></span>
            <p>Carregando Arquivo...</p>
          </div>
        ) : (
          <Document
            file={blobUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="pdf-loading">
                <span className="spinner spinner-lg"></span>
                <p>Processando E-book...</p>
              </div>
            }
            error={
              <div className="pdf-error">
                <p>Erro ao ler o documento PDF.</p>
              </div>
            }
          >
            {numPages && Array.from(new Array(numPages), (el, index) => (
              <div key={`page_${index + 1}`} className="pdf-page-wrapper">
                <Page 
                  pageNumber={index + 1} 
                  scale={scale} 
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  loading={
                    <div className="pdf-page-loading">
                      <span className="spinner"></span>
                    </div>
                  }
                />
              </div>
            ))}
          </Document>
        )}
      </div>
    </div>
  )
}
