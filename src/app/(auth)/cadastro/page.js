'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import PartnerBadge from '@/components/ui/PartnerBadge'
import { IconMail } from '@/components/icons'

export default function CadastroPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

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
          <div className="text-center">
            <div className="landing-feature-icon" style={{ margin: '0 auto var(--space-lg)' }}>
              <IconMail size={28} />
            </div>
            <h2 className="mb-md">Verifique seu e-mail</h2>
            <p className="text-secondary mb-xl">
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
          <div className="flex items-center justify-center mt-md">
            <PartnerBadge label="Em parceria com" size={36} />
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} id="cadastro-form">
          {error && (
            <div className="form-feedback form-feedback-error" style={{ textAlign: 'left', borderLeft: '3px solid var(--error)' }}>
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
