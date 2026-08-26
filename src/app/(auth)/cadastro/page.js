'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CadastroPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Este e-mail já está cadastrado.')
        } else {
          setError(authError.message)
        }
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card glass-card-strong">
          <div className="auth-logo">
            <h1>
              <span className="text-gradient">Koda</span>Books
            </h1>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>✉️</div>
            <h2 style={{ marginBottom: 'var(--space-md)' }}>Verifique seu e-mail</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
              Enviamos um link de confirmação para <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
              Clique no link para ativar sua conta.
            </p>
            <Link href="/login" className="btn btn-primary btn-lg">
              Ir para o Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-card-strong">
        <div className="auth-logo">
          <h1>
            <span className="text-gradient">Koda</span>Books
          </h1>
          <p>Crie sua conta gratuita</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '16px', opacity: 0.9 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Em parceria com</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src="/scorpionbits-logo.png" alt="ScorpionBits Logo" style={{ width: '36px', height: '36px', filter: 'brightness(0) invert(1)' }} />
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>ScorpionBits</span>
            </div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} id="cadastro-form">
          {error && (
            <div style={{
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
            <label htmlFor="fullName" className="form-label">Nome completo</label>
            <input
              id="fullName"
              type="text"
              className="form-input"
              placeholder="Seu nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirmar senha</label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            id="cadastro-submit"
          >
            {loading ? (
              <>
                <span className="spinner" /> Criando conta...
              </>
            ) : (
              'Criar conta'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Já tem uma conta?{' '}
          <Link href="/login">Faça login</Link>
        </div>
      </div>
    </div>
  )
}
