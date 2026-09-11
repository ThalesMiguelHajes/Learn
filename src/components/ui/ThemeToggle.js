'use client'

import { useState, useEffect } from 'react'
import { IconSun, IconMoon } from '@/components/icons'

export const THEME_STORAGE_KEY = 'learn-theme'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    // Reads the attribute the anti-flash script in layout.js already set on <html>
    // before hydration — must happen in an effect since `document` isn't available
    // during the server render, and reading it in the initializer would risk a
    // hydration mismatch on the active-button className.
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current)
  }, [])

  function applyTheme(next) {
    setTheme(next)
    if (next === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {}
  }

  return (
    <div className="theme-toggle-group">
      <button
        type="button"
        className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => applyTheme('dark')}
      >
        <IconMoon size={18} /> Escuro
      </button>
      <button
        type="button"
        className={`theme-option ${theme === 'light' ? 'active' : ''}`}
        onClick={() => applyTheme('light')}
      >
        <IconSun size={18} /> Claro
      </button>
    </div>
  )
}
