import Link from 'next/link'
import Image from 'next/image'
import { createServiceClient } from '@/lib/supabase/server'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import PartnerBadge from '@/components/ui/PartnerBadge'
import { IconZap, IconDevices, IconLock } from '@/components/icons'

export const metadata = {
  title: 'KodaBooks | Evolua seu conhecimento',
  description: 'Acesse e-books exclusivos e práticos na KodaBooks. Feito com ScorpionBits.',
}

const FEATURES = [
  { icon: IconZap, title: 'Acesso Imediato', text: 'Receba seu material na mesma hora e comece a aprender sem enrolação.' },
  { icon: IconDevices, title: 'Leia em Qualquer Lugar', text: 'Baixe seus e-books e estude no celular, tablet ou computador, a qualquer momento.' },
  { icon: IconLock, title: 'Pagamento Seguro', text: 'Pagamentos rápidos e totalmente seguros processados via AbacatePay (PIX).' },
]

const FAQ = [
  { q: 'Como recebo o acesso?', a: 'Após a confirmação do pagamento, o e-book será adicionado automaticamente à sua biblioteca virtual e você receberá um e-mail de aviso.' },
  { q: 'É seguro comprar?', a: 'Sim, utilizamos a AbacatePay para intermediar todos os pagamentos (PIX), garantindo 100% de segurança na sua transação e seus dados.' },
  { q: 'Posso ler offline?', a: 'Sim! Uma vez liberado na sua biblioteca, você pode baixar o PDF para o seu dispositivo e ler quando e onde quiser, sem internet.' },
]

export default async function LandingPage() {
  const supabase = createServiceClient()

  // Buscar até 4 e-books ativos para a vitrine
  const { data: ebooks } = await supabase
    .from('ebooks')
    .select('*')
    .eq('is_active', true)
    .limit(4)

  return (
    <div className="page-shell">
      <header className="landing-header">
        <div className="landing-header-brand">
          <h1 className="landing-logo">
            <span className="text-gradient">Koda</span>Books
          </h1>
          <div className="landing-header-partner">
            <PartnerBadge label="by" />
          </div>
        </div>
        <div className="flex gap-md">
          <Link href="/login" className="btn btn-secondary">
            Entrar
          </Link>
          <Link href="/cadastro" className="btn btn-primary">
            Começar Agora
          </Link>
        </div>
      </header>

      <main>
        <Reveal y={20}>
          <section className="landing-hero">
            <h2 className="landing-hero-title">
              Evolua seu conhecimento com a <span className="text-gradient">KodaBooks</span>
            </h2>
            <p className="landing-hero-subtitle">
              Descubra materiais práticos, diretos ao ponto e aprenda no seu ritmo.
              Sua biblioteca digital premium a um clique de distância.
            </p>
            <div className="flex gap-md justify-center" style={{ flexWrap: 'wrap' }}>
              <Link href="/cadastro" className="btn btn-primary btn-lg">
                Explorar Catálogo Livre
              </Link>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="landing-features">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card landing-feature-card">
                <div className="landing-feature-icon"><f.icon size={28} /></div>
                <h3>{f.title}</h3>
                <p className="text-secondary">{f.text}</p>
              </div>
            ))}
          </section>
        </Reveal>

        {ebooks && ebooks.length > 0 && (
          <Reveal>
            <section className="landing-showcase">
              <div className="landing-showcase-inner">
                <div className="text-center mb-xl">
                  <h2>Destaques do Catálogo</h2>
                  <p className="text-secondary">Os conteúdos mais procurados do momento.</p>
                </div>

                <div className="ebook-grid">
                  {ebooks.map((ebook, index) => (
                    <Link
                      key={ebook.id}
                      href="/cadastro"
                      className="glass-card ebook-card animate-in"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      {ebook.cover_url ? (
                        <div className="ebook-card-cover">
                          <Image
                            src={ebook.cover_url}
                            alt={`Capa de ${ebook.title}`}
                            fill
                            sizes="(max-width: 768px) 45vw, 280px"
                          />
                        </div>
                      ) : (
                        <div className="ebook-card-cover ebook-card-cover-placeholder">
                          <IconDevices size={40} />
                        </div>
                      )}
                      <div className="ebook-card-body">
                        <h3 className="ebook-card-title">{ebook.title}</h3>
                        <div className="ebook-card-footer mt-md">
                          <span className="ebook-card-price">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ebook.price || 0)}
                          </span>
                          <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                            Comprar &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="text-center mt-xl">
                  <Link href="/cadastro" className="btn btn-secondary btn-lg">
                    Ver Catálogo Completo
                  </Link>
                </div>
              </div>
            </section>
          </Reveal>
        )}

        <Reveal>
          <section className="landing-faq">
            <h2 className="text-center mb-xl">Perguntas Frequentes</h2>
            <div className="flex flex-col gap-md">
              {FAQ.map((item) => (
                <div key={item.q} className="glass-card landing-faq-item">
                  <h3>{item.q}</h3>
                  <p className="text-secondary">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="landing-cta">
            <h2 className="mb-md">Pronto para dar o próximo passo?</h2>
            <p className="text-secondary mb-xl" style={{ fontSize: '1.125rem' }}>
              Crie sua conta gratuitamente em menos de 1 minuto e tenha acesso à sua biblioteca particular.
            </p>
            <Link href="/cadastro" className="btn btn-primary btn-lg">
              Criar Conta Grátis
            </Link>
          </section>
        </Reveal>
      </main>

      <Footer />
    </div>
  )
}
