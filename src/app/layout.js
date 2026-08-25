import './globals.css'

export const metadata = {
  title: 'KodaBooks — Plataforma de E-books',
  description: 'Sua biblioteca digital de e-books premium. Acesse seus livros de qualquer lugar.',
  keywords: ['ebooks', 'livros digitais', 'biblioteca digital', 'KodaBooks'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
