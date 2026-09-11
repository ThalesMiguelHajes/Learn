import Link from 'next/link'
import Footer from '@/components/Footer'
import { IconArrowLeft } from '@/components/icons'

export const metadata = {
  title: 'Política de Privacidade — Learn',
}

export default function PrivacidadePage() {
  return (
    <div className="page-shell">
      <div className="page-shell-content">
        <div className="legal-page">
          <Link href="/" className="back-link">
            <IconArrowLeft size={16} /> Voltar
          </Link>

          <h1>Política de Privacidade</h1>
          <p className="legal-updated">Última atualização: 27 de agosto de 2026</p>

          <p>
            Esta Política de Privacidade explica como a Learn, operada pela ScorpionBits,
            coleta, usa e protege os dados pessoais dos usuários da plataforma, em conformidade
            com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
          </p>

          <h2>1. Dados que coletamos</h2>
          <ul>
            <li>Nome completo e e-mail, no momento do cadastro.</li>
            <li>CPF e telefone, exigidos pela AbacatePay para processar pagamentos via PIX.</li>
            <li>Histórico de compras e e-books adquiridos, para liberar o acesso à sua biblioteca.</li>
          </ul>

          <h2>2. Como usamos seus dados</h2>
          <p>
            Usamos seus dados exclusivamente para viabilizar a criação de conta, processar
            pagamentos, liberar o acesso aos e-books comprados e enviar comunicações
            relacionadas à sua conta (confirmação de compra, verificação de e-mail, avisos
            de acesso liberado). Não vendemos nem compartilhamos seus dados com terceiros
            para fins de marketing.
          </p>

          <h2>3. Compartilhamento com terceiros</h2>
          <p>
            Compartilhamos apenas as informações estritamente necessárias com a AbacatePay,
            nosso processador de pagamentos, para viabilizar a cobrança via PIX. Nenhum outro
            terceiro tem acesso aos seus dados pessoais.
          </p>

          <h2>4. Armazenamento e segurança</h2>
          <p>
            Seus dados são armazenados de forma segura no Supabase, com controle de acesso
            por autenticação e políticas de segurança em nível de linha (Row Level Security),
            garantindo que cada usuário só acesse seus próprios dados.
          </p>

          <h2>5. Seus direitos</h2>
          <p>
            Conforme a LGPD, você pode solicitar a qualquer momento a confirmação, acesso,
            correção ou exclusão dos seus dados pessoais, entrando em contato pelos canais
            abaixo.
          </p>

          <h2>6. Contato</h2>
          <p>
            Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato
            pelo e-mail{' '}
            <a href="mailto:scorpionbits.contato@gmail.com">scorpionbits.contato@gmail.com</a>.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
