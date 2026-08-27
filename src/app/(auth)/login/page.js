'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import PartnerBadge from '@/components/ui/PartnerBadge'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
          <div className="flex items-center justify-center mt-md">
            <PartnerBadge label="Em parceria com" size={36} />
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} id="login-form">
          {error && (
            <div className="form-feedback form-feedback-error" style={{ textAlign: 'left', borderLeft: '3px solid var(--error)' }}>
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
