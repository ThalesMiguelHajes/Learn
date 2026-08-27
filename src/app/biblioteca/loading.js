import Image from 'next/image'

export default function Loading() {
  return (
    <div className="loading-page">
      <Image src="/scorpionbits-logo.png" alt="Carregando..." width={60} height={60} className="loading-logo-pulse" priority />
    </div>
  )
}
