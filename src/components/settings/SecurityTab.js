'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IconEye, IconEyeOff } from '@/components/icons'

function PasswordField({ label, value, onChange, autoComplete }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="password-field">
        <input
          type={visible ? 'text' : 'password'}
          className="form-input"
          value={value}
          onChange={onChange}
          required
          minLength={6}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="password-field-toggle"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
        </button>
      </div>
    </div>
  )
}

export default function SecurityTab({ email }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const supabase = createClient()

  async function handleSubmit(e) {
    e.preventDefault()
    setFeedback(null)

    if (newPassword.length < 6) {
      setFeedback({ type: 'error', msg: 'A nova senha deve ter pelo menos 6 caracteres.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', msg: 'As senhas não coincidem.' })
      return
    }

    setLoading(true)

    // Confirma a senha atual reautenticando antes de trocar
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    })

    if (authError) {
      setFeedback({ type: 'error', msg: 'Senha atual incorreta.' })
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setFeedback({ type: 'error', msg: 'Erro ao atualizar a senha. Tente novamente.' })
    } else {
      setFeedback({ type: 'success', msg: 'Senha atualizada com sucesso!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: 380 }}>
      <h3 className="mb-xs">Alterar senha</h3>
      <p className="text-secondary mb-md" style={{ fontSize: '0.875rem' }}>
        Confirme sua senha atual para definir uma nova.
      </p>

      {feedback && (
        <div className={`form-feedback form-feedback-${feedback.type}`}>
          {feedback.msg}
        </div>
      )}

      <PasswordField
        label="Senha atual"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        autoComplete="current-password"
      />
      <PasswordField
        label="Nova senha"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        autoComplete="new-password"
      />
      <PasswordField
        label="Confirmar nova senha"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
      />

      <button type="submit" className="btn btn-primary justify-center mt-sm" disabled={loading}>
        {loading ? <><span className="spinner" /> Salvando...</> : 'Atualizar senha'}
      </button>
    </form>
  )
}
