'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { IconSearch } from '@/components/icons'

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
    <div className="search-bar mb-lg">
      <span className="search-icon"><IconSearch size={18} /></span>
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  )
}
