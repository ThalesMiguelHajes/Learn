import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      padding: 'var(--space-2xl) 0 var(--space-xl)',
      marginTop: 'auto',
      background: 'var(--bg-primary)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 var(--space-xl)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-2xl)'
      }}>
        {/* Brand Column */}
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 800,
            marginBottom: 'var(--space-sm)'
          }}>
            <span className="text-gradient">Koda</span>Books
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--space-lg)' }}>
            Evolua seu conhecimento com e-books práticos e diretos ao ponto.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Plataforma by
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <img src="/scorpionbits-logo.png" alt="ScorpionBits" style={{ width: '20px', height: '20px', filter: 'brightness(0) invert(1)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>ScorpionBits</span>
            </div>
          </div>
        </div>

        {/* Links Column */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>Navegação</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <li>
              <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                Fazer Login
              </Link>
            </li>
            <li>
              <Link href="/cadastro" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                Criar Conta
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal Column */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>Legal</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <li>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                Termos de Uso
              </a>
            </li>
            <li>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                Política de Privacidade
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: 'var(--space-2xl) auto 0',
        padding: 'var(--space-lg) var(--space-xl) 0',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-md)'
      }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', margin: 0 }}>
          &copy; {new Date().getFullYear()} KodaBooks. Todos os direitos reservados.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          {/* Pagamentos Seguros via AbacatePay badge / text */}
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Pagamento Seguro via <strong>AbacatePay</strong>
          </span>
        </div>
      </div>
    </footer>
  )
}
