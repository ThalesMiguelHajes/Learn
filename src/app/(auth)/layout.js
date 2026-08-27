import Footer from '@/components/Footer'

export default function AuthLayout({ children }) {
  return (
    <div className="page-shell">
      <div className="page-shell-content">
        {children}
      </div>
      <Footer />
    </div>
  )
}
