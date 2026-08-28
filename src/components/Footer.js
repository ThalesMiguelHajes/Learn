import Link from 'next/link'
import PartnerBadge from '@/components/ui/PartnerBadge'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div>
          <h2 className="site-footer-brand">
            <span className="text-gradient">Koda</span>Books
          </h2>
          <p className="text-secondary mb-lg" style={{ fontSize: '0.9rem' }}>
            Evolua seu conhecimento com e-books práticos e diretos ao ponto.
          </p>
          <PartnerBadge label="Plataforma by" />
        </div>

        <div>
          <h3 className="site-footer-heading">Navegação</h3>
          <ul className="site-footer-links">
            <li><Link href="/login">Fazer Login</Link></li>
            <li><Link href="/cadastro">Criar Conta</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="site-footer-heading">Legal e Contato</h3>
          <ul className="site-footer-links">
            <li><a href="mailto:scorpionbits.contato@gmail.com">Contato</a></li>
            <li><Link href="/termos">Termos de Uso</Link></li>
            <li><Link href="/privacidade">Política de Privacidade</Link></li>
          </ul>
        </div>
      </div>

      <div className="site-footer-bottom">
        <p>&copy; {new Date().getFullYear()} KodaBooks. Todos os direitos reservados.</p>
        <span>Pagamento Seguro via <strong>AbacatePay</strong></span>
      </div>
    </footer>
  )
}
