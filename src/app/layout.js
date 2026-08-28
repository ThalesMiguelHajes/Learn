import './globals.css'

export const metadata = {
  title: 'KodaBooks — Plataforma de E-books',
  description: 'Sua biblioteca digital de e-books premium. Acesse seus livros de qualquer lugar.',
  keywords: ['ebooks', 'livros digitais', 'biblioteca digital', 'KodaBooks'],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

const THEME_INIT_SCRIPT = `
try {
  var t = localStorage.getItem('kodabooks-theme');
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
