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

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
