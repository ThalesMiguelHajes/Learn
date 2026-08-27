'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function CheckoutClient({ ebook, userProfile }) {
  const [cpf, setCpf] = useState(userProfile?.cpf || '')
  const [phone, setPhone] = useState(userProfile?.phone || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const priceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(ebook.price || 0)

  async function handleCheckout(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Limpar máscaras para validação básica
    const cleanCpf = cpf.replace(/\D/g, '')
    const cleanPhone = phone.replace(/\D/g, '')

    if (cleanCpf.length !== 11) {
      setError('Por favor, insira um CPF válido (11 dígitos).')
      setLoading(false)
      return
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      setError('Por favor, insira um telefone válido com DDD.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ebookId: ebook.id,
          cpf: cleanCpf,
          phone: cleanPhone
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError('Você já possui este e-book. Acesse sua biblioteca!')
          return
        }
        if (response.status === 401) {
          router.push('/login')
          return
        }
        setError(data.error || 'Não foi possível iniciar o pagamento.')
        return
      }

      // Redireciona para a página de pagamento PIX da AbacatePay
      window.location.href = data.url
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Máscara simples para CPF (000.000.000-00)
  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    setCpf(value)
  }

  // Máscara simples para Telefone ( (00) 00000-0000 )
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    value = value.replace(/^(\d{2})(\d)/g, '($1) $2')
    value = value.replace(/(\d)(\d{4})$/, '$1-$2')
    setPhone(value)
  }

  return (
    <div className="checkout-layout">
      <div className="glass-card panel">
        <h2 className="checkout-section-title">Resumo do Pedido</h2>

        <div className="checkout-summary-item">
          {ebook.cover_url ? (
            <Image src={ebook.cover_url} alt={ebook.title} width={80} height={110} className="checkout-cover" />
          ) : (
            <div className="checkout-cover" style={{ background: 'var(--bg-tertiary)' }} />
          )}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-xs)', color: 'var(--text-primary)' }}>
              {ebook.title}
            </h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
              E-book Digital
            </p>
          </div>
        </div>

        <div className="checkout-total">
          <span>Total a pagar:</span>
          <span>{priceFormatted}</span>
        </div>
      </div>

      <div className="glass-card panel">
        <h2 className="checkout-section-title">Dados de Cobrança</h2>
        <p className="text-tertiary mb-lg" style={{ fontSize: '0.85rem' }}>
          A AbacatePay exige CPF e Telefone para processar pagamentos via PIX. Seus dados são salvos com segurança.
        </p>

        <form onSubmit={handleCheckout} className="auth-form">
          <div className="form-group">
            <label className="form-label">CPF</label>
            <input
              type="text"
              required
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Telefone / WhatsApp</label>
            <input
              type="text"
              required
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              className="form-input"
            />
          </div>

          {error && (
            <div className="form-feedback form-feedback-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary justify-center mt-md"
          >
            {loading ? <><span className="spinner" /> Gerando PIX...</> : 'Gerar Pagamento PIX'}
          </button>
        </form>
      </div>
    </div>
  )
}
