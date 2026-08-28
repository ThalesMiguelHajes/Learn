'use client'

import { useState, useRef, useEffect } from 'react'
import { IconCheck } from '@/components/icons'

export default function Combobox({ options, value, onChange, placeholder = 'Buscar...', emptyLabel = 'Nenhum resultado' }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const selected = options.find(o => o.value === value)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options

  function handleSelect(opt) {
    onChange(opt.value)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="combobox" ref={containerRef}>
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={open ? query : (selected ? selected.label : '')}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        autoComplete="off"
      />
      {open && (
        <div className="combobox-dropdown">
          {filtered.length === 0 ? (
            <div className="combobox-empty">{emptyLabel}</div>
          ) : (
            filtered.map(opt => (
              <button
                type="button"
                key={opt.value}
                className={`combobox-option ${opt.value === value ? 'active' : ''}`}
                onClick={() => handleSelect(opt)}
              >
                <span>{opt.label}</span>
                {opt.value === value && <IconCheck size={16} />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
