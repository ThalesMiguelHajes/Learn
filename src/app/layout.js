import './globals.css'

export const metadata = {
  title: 'Learn — Plataforma de Ensino de Jogos',
  description: 'Sua plataforma definitiva para aprender desenvolvimento de jogos, programação e motores gráficos.',
  keywords: ['jogos', 'desenvolvimento de jogos', 'game dev', 'programação', 'Learn'],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

const THEME_INIT_SCRIPT = `
try {
  var t = localStorage.getItem('learn-theme');
  if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
} catch (e) {}
`

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        {/* Runs before paint so a saved light-mode preference doesn't flash dark first. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {children}
      </body>
    </html>
  )
}
