'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SearchBar({ placeholder = "Pesquisar..." }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const initialQuery = searchParams.get('q') || ''
  const [text, setText] = useState(initialQuery)

  useEffect(() => {
    const handler = setTimeout(() => {
      const currentQuery = searchParams.get('q') || ''
      if (text !== currentQuery) {
        if (text) {
          router.push(`?q=${encodeURIComponent(text)}`)
        } else {
          router.push('?')
        }
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(handler)
  }, [text, router, searchParams])

  return (
    <div className="search-bar" style={{ marginBottom: 'var(--space-lg)' }}>
      <div className="input-group" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
          🔍
        </div>
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ paddingLeft: '48px', height: '48px', borderRadius: 'var(--radius-lg)' }}
        />
      </div>
    </div>
  )
}
