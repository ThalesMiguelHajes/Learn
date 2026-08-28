import Link from 'next/link'
import Footer from '@/components/Footer'
import { IconArrowLeft } from '@/components/icons'

export const metadata = {
  title: 'Termos de Uso — KodaBooks',
}

export default function TermosPage() {
  return (
    <div className="page-shell">
      <div className="page-shell-content">
        <div className="legal-page">
          <Link href="/" className="back-link">
            <IconArrowLeft size={16} /> Voltar
          </Link>

          <h1>Termos de Uso</h1>
          <p className="legal-updated">Última atualização: 27 de agosto de 2026</p>

          <p>
            Estes Termos de Uso regulam o acesso e a utilização da plataforma KodaBooks
            (&ldquo;Plataforma&rdquo;), operada pela ScorpionBits, para a venda e distribuição de
            e-books digitais. Ao criar uma conta ou realizar uma compra, você concorda com
            as condições descritas a seguir.
          </p>

          <h2>1. Cadastro e conta</h2>
          <p>
            Para comprar e acessar e-books, é necessário criar uma conta com nome completo,
            e-mail válido e senha. Você é responsável por manter a confidencialidade das suas
            credenciais e por todas as atividades realizadas na sua conta.
          </p>

          <h2>2. Compra e pagamento</h2>
          <p>
            Os pagamentos são processados via PIX através da AbacatePay, nossa parceira de
            pagamentos. Para gerar a cobrança, solicitamos CPF e telefone, exigidos pelo
            processador de pagamento para validar a transação. Após a confirmação do
            pagamento, o e-book é liberado automaticamente na sua biblioteca.
          </p>

          <h2>3. Licença de uso</h2>
          <p>
            A compra de um e-book concede uma licença pessoal, não exclusiva e intransferível
            para leitura e download do conteúdo. É proibido redistribuir, revender, compartilhar
            publicamente ou reproduzir os e-books sem autorização expressa.
          </p>

          <h2>4. Reembolsos</h2>
          <p>
            Por se tratar de conteúdo digital com acesso imediato, reembolsos são avaliados
            caso a caso. Entre em contato pelos canais informados no rodapé em até 7 dias
            após a compra caso encontre algum problema com o material adquirido.
          </p>

          <h2>5. Disponibilidade do serviço</h2>
          <p>
            Nos esforçamos para manter a Plataforma disponível e funcionando corretamente,
            mas não garantimos operação ininterrupta. Manutenções, atualizações ou instabilidades
            podem ocorrer eventualmente.
          </p>

          <h2>6. Alterações nestes termos</h2>
          <p>
            Podemos atualizar estes Termos periodicamente. Mudanças relevantes serão
            comunicadas por e-mail ou aviso na Plataforma. O uso continuado após uma
            atualização implica concordância com os novos termos.
          </p>

          <h2>7. Contato</h2>
          <p>
            Dúvidas sobre estes Termos podem ser enviadas para{' '}
            <a href="mailto:scorpionbits.contato@gmail.com">scorpionbits.contato@gmail.com</a>.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
