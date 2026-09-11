import Link from 'next/link'
import Image from 'next/image'
import { getFeaturedCatalog } from '@/lib/services/catalog'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import PartnerBadge from '@/components/ui/PartnerBadge'
import { IconZap, IconDevices, IconLock } from '@/components/icons'

export const metadata = {
  title: 'Learn | Desenvolvimento de Jogos',
  description: 'Aprenda desenvolvimento de jogos do zero no Learn. Feito com ScorpionBits.',
}

// ISR: O Next.js fará o build dessa página estática e vai revalidá-la em cache a cada 1 hora (3600 segundos).
// Isso poupa o banco de dados de sobrecarga e faz o site carregar instantaneamente na CDN.
export const revalidate = 3600

const FEATURES = [
  { icon: IconZap, title: 'Acesso Imediato', text: 'Receba seu material na mesma hora e comece a aprender sem enrolação.' },
  { icon: IconDevices, title: 'Aprenda no seu Ritmo', text: 'Acesse seus cursos e estude no celular, tablet ou computador, a qualquer momento.' },
  { icon: IconLock, title: 'Pagamento Seguro', text: 'Pagamentos rápidos e totalmente seguros processados via AbacatePay (PIX).' },
]

const FAQ = [
  { q: 'Como recebo o acesso?', a: 'Após a confirmação do pagamento, o conteúdo será adicionado automaticamente à sua biblioteca virtual e você receberá um e-mail de aviso.' },
  { q: 'É seguro comprar?', a: 'Sim, utilizamos a AbacatePay para intermediar todos os pagamentos (PIX), garantindo 100% de segurança na sua transação e seus dados.' },
  { q: 'Posso ler offline?', a: 'Sim! Uma vez liberado na sua biblioteca, você terá acesso imediato para o seu dispositivo e ler quando e onde quiser, sem internet.' },
]

export default async function LandingPage() {
  let ebooks = []
  let materials = []
  let courses = []

  try {
    // Buscamos todos os dados usando o serviço abstraído, mantendo o componente UI limpo
    const catalog = await getFeaturedCatalog()
    
    ebooks = catalog.ebooks
    materials = catalog.materials
    courses = catalog.courses
  } catch (error) {
    console.error('Erro ao buscar catálogo na página:', error)
    // Lançamos o erro para que o Next.js ative o error.js automaticamente
    throw new Error('Não foi possível carregar o catálogo no momento.')
  }

  return (
    <div className="page-shell">
      <header className="landing-header">
        <div className="landing-header-brand">
          <h1 className="landing-logo">
            <span className="text-gradient">Learn</span>
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
              Aprenda a criar seus próprios jogos com o <span className="text-gradient">Learn</span>
            </h2>
            <p className="landing-hero-subtitle">
              Aprenda lógica de programação, domine motores gráficos e crie seus jogos do zero.
              Cursos práticos, diretos ao ponto, para alavancar sua jornada gamedev.
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

        {courses && courses.length > 0 && (
          <Reveal>
            <section className="landing-showcase">
              <div className="landing-showcase-inner">
                <div className="text-center mb-xl">
                  <h2>Cursos em Vídeo</h2>
                  <p className="text-secondary">Aprenda com aulas práticas e direto ao ponto.</p>
                </div>

                <div className="ebook-grid">
                  {courses.map((course, index) => (
                    <Link
                      key={course.id}
                      href={`/biblioteca/checkout/${course.id}?type=course`}
                      className="glass-card ebook-card animate-in"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      {course.cover_url ? (
                        <div className="ebook-card-cover">
                          <Image
                            src={course.cover_url}
                            alt={`Capa de ${course.title}`}
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
                        <h3 className="ebook-card-title">{course.title}</h3>
                        <div className="ebook-card-footer mt-md">
                          <span className="ebook-card-price">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(course.price || 0)}
                          </span>
                          <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                            Comprar &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </Reveal>
        )}

        {ebooks && ebooks.length > 0 && (
          <Reveal>
            <section className="landing-showcase" style={{ paddingTop: '2rem' }}>
              <div className="landing-showcase-inner">
                <div className="text-center mb-xl">
                  <h2>Outros Materiais</h2>
                  <p className="text-secondary">Materiais complementares para turbinar seus estudos.</p>
                </div>

                <div className="ebook-grid">
                  {ebooks.map((ebook, index) => (
                    <Link
                      key={ebook.id}
                      href={`/biblioteca/checkout/${ebook.id}?type=ebook`}
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
              </div>
            </section>
          </Reveal>
        )}

        {materials && materials.length > 0 && (
          <Reveal>
            <section className="landing-showcase" style={{ paddingTop: '2rem' }}>
              <div className="landing-showcase-inner">
                <div className="text-center mb-xl">
                  <h2>Materiais Práticos</h2>
                  <p className="text-secondary">Códigos-fonte, assets e slides para ir direto ao ponto.</p>
                </div>

                <div className="ebook-grid">
                  {materials.map((material, index) => (
                    <Link
                      key={material.id}
                      href={`/biblioteca/checkout/${material.id}?type=material`}
                      className="glass-card ebook-card animate-in"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      {material.cover_url ? (
                        <div className="ebook-card-cover">
                          <Image
                            src={material.cover_url}
                            alt={`Capa de ${material.title}`}
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
                        <h3 className="ebook-card-title">{material.title}</h3>
                        <div className="ebook-card-footer mt-md">
                          <span className="badge badge-info">{material.material_type?.toUpperCase()}</span>
                          <span className="ebook-card-price">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(material.price || 0)}
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
