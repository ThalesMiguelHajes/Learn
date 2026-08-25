'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login')) {
          setError('E-mail ou senha inválidos.')
        } else {
          setError(authError.message)
        }
        return
      }

      // Get user role to redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/biblioteca'
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-card-strong">
        <div className="auth-logo">
          <h1>
            <span className="text-gradient">Koda</span>Books
          </h1>
          <p>Acesse sua biblioteca digital</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', opacity: 0.8 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Em parceria com</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <img src="/scorpionbits-logo.png" alt="ScorpionBits Logo" style={{ width: '20px', height: '20px', filter: 'brightness(0) invert(1)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>ScorpionBits</span>
            </div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} id="login-form">
          {error && (
            <div className="toast-error" style={{
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--error-soft)',
              color: 'var(--error)',
              fontSize: '0.875rem',
              borderLeft: '3px solid var(--error)',
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Senha</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            id="login-submit"
          >
            {loading ? (
              <>
                <span className="spinner" /> Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Não tem uma conta?{' '}
          <Link href="/cadastro">Cadastre-se</Link>
        </div>
      </div>
    </div>
  )
}
