'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 'var(--space-xl)',
    }}>
      <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
        <h2 style={{ 
          fontSize: '1.2rem', 
          marginBottom: 'var(--space-md)',
          color: 'var(--text-primary)'
        }}>
          Resumo do Pedido
        </h2>
        
        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          {ebook.cover_url ? (
            <img 
              src={ebook.cover_url} 
              alt={ebook.title} 
              style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
            />
          ) : (
            <div style={{ width: '80px', height: '110px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }} />
          )}
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 var(--space-xs) 0', color: 'var(--text-primary)' }}>
              {ebook.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              E-book Digital
            </p>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: 'var(--space-md)',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          color: 'var(--text-primary)'
        }}>
          <span>Total a pagar:</span>
          <span>{priceFormatted}</span>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
        <h2 style={{ 
          fontSize: '1.2rem', 
          marginBottom: 'var(--space-sm)',
          color: 'var(--text-primary)'
        }}>
          Dados de Cobrança
        </h2>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 'var(--space-lg)' }}>
          A AbacatePay exige CPF e Telefone para processar pagamentos via PIX. Seus dados são salvos com segurança.
        </p>

        <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              CPF
            </label>
            <input 
              type="text" 
              required
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              className="form-input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Telefone / WhatsApp
            </label>
            <input 
              type="text" 
              required
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              className="form-input"
              style={{ width: '100%' }}
            />
          </div>

          {error && (
            <div style={{ 
              color: 'var(--error, #f87171)', 
              fontSize: '0.9rem', 
              padding: 'var(--space-sm)', 
              background: 'rgba(248, 113, 113, 0.1)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(248, 113, 113, 0.2)'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
            style={{ 
              marginTop: 'var(--space-md)', 
              opacity: loading ? 0.7 : 1, 
              cursor: loading ? 'wait' : 'pointer',
              justifyContent: 'center',
              padding: 'var(--space-sm) var(--space-xl)'
            }}
          >
            {loading ? '⏳ Gerando PIX...' : 'Gerar Pagamento PIX'}
          </button>
        </form>
      </div>
    </div>
  )
}
