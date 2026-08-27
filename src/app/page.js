import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'

export const metadata = {
  title: 'KodaBooks | Evolua seu conhecimento',
  description: 'Acesse e-books exclusivos e práticos na KodaBooks. Feito com ScorpionBits.',
}

export default async function LandingPage() {
  const supabase = createServiceClient()
  
  // Buscar até 4 e-books ativos para a vitrine
  const { data: ebooks } = await supabase
    .from('ebooks')
    .select('*')
    .eq('is_active', true)
    .limit(4)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header/Nav */}
      <header style={{
        padding: 'var(--space-md) var(--space-xl)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
          <span className="text-gradient">Koda</span>Books
        </h1>
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <Link href="/login" className="btn btn-secondary">
            Entrar
          </Link>
          <Link href="/cadastro" className="btn btn-primary">
            Começar Agora
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1 }}>
        <Reveal y={20}>
          <section style={{
            padding: 'var(--space-3xl) var(--space-xl)',
            textAlign: 'center',
            background: 'linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-lg)'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              background: 'var(--accent-gradient-soft)',
              color: 'var(--accent-secondary)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: 'var(--space-sm)'
            }}>
              Novo e Melhorado ✨
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              maxWidth: '800px',
              lineHeight: 1.1,
              letterSpacing: '-0.02em'
            }}>
              Evolua seu conhecimento com a <span className="text-gradient">KodaBooks</span>
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              lineHeight: 1.6,
              marginBottom: 'var(--space-md)'
            }}>
              Descubra materiais práticos, diretos ao ponto e aprenda no seu ritmo. 
              Sua biblioteca digital premium a um clique de distância.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/cadastro" className="btn btn-primary btn-lg" style={{ fontSize: '1.125rem', padding: '12px 32px' }}>
                Explorar Catálogo Livre
              </Link>
            </div>
          </section>
        </Reveal>

        {/* Features / Benefícios */}
        <Reveal>
          <section style={{
            padding: 'var(--space-3xl) var(--space-xl)',
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-xl)'
          }}>
            <div className="glass-card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🚀</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-sm)' }}>Acesso Imediato</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Receba seu material na mesma hora e comece a aprender sem enrolação.</p>
            </div>
            <div className="glass-card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📱</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-sm)' }}>Leia em Qualquer Lugar</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Baixe seus e-books e estude no celular, tablet ou computador, a qualquer momento.</p>
            </div>
            <div className="glass-card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🔒</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-sm)' }}>Pagamento Seguro</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Pagamentos rápidos e totalmente seguros processados via AbacatePay (PIX).</p>
            </div>
          </section>
        </Reveal>

        {/* Vitrine (E-books reais) */}
        {ebooks && ebooks.length > 0 && (
          <Reveal>
            <section style={{
              padding: 'var(--space-3xl) var(--space-xl)',
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
                  <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-xs)' }}>
                    Destaques do Catálogo
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Os conteúdos mais procurados do momento.</p>
                </div>

                <div className="ebook-grid">
                  {ebooks.map((ebook, index) => (
                    <Link 
                      key={ebook.id}
                      href="/cadastro"
                      className="glass-card ebook-card animate-in"
                      style={{ animationDelay: `${index * 80}ms`, textDecoration: 'none', display: 'block', cursor: 'pointer' }}
                    >
                      {ebook.cover_url ? (
                        <img
                          src={ebook.cover_url}
                          alt={`Capa de ${ebook.title}`}
                          className="ebook-card-cover"
                        />
                      ) : (
                        <div className="ebook-card-cover" style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3rem',
                          background: 'var(--bg-tertiary)',
                        }}>
                          📖
                        </div>
                      )}
                      <div className="ebook-card-body">
                        <h3 className="ebook-card-title">{ebook.title}</h3>
                        <div className="ebook-card-footer" style={{ marginTop: 'var(--space-md)' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>
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
                
                <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
                   <Link href="/cadastro" className="btn btn-secondary btn-lg">
                      Ver Catálogo Completo
                   </Link>
                </div>
              </div>
            </section>
          </Reveal>
        )}

        {/* FAQ Section */}
        <Reveal>
          <section style={{
            padding: 'var(--space-3xl) var(--space-xl)',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2xl)', textAlign: 'center' }}>
              Perguntas Frequentes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-xs)' }}>Como recebo o acesso?</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Após a confirmação do pagamento, o e-book será adicionado automaticamente à sua biblioteca virtual e você receberá um e-mail de aviso.</p>
              </div>
              <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-xs)' }}>É seguro comprar?</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Sim, utilizamos a AbacatePay para intermediar todos os pagamentos (PIX), garantindo 100% de segurança na sua transação e seus dados.</p>
              </div>
              <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-xs)' }}>Posso ler offline?</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Sim! Uma vez liberado na sua biblioteca, você pode baixar o PDF para o seu dispositivo e ler quando e onde quiser, sem internet.</p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Bottom CTA */}
        <Reveal>
          <section style={{
            padding: 'var(--space-3xl) var(--space-xl)',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)' }}>
              Pronto para dar o próximo passo?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', fontSize: '1.125rem' }}>
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
