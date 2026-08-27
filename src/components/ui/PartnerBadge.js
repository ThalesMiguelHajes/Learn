import Image from 'next/image'

export default function PartnerBadge({ label, size = 20 }) {
  return (
    <div className="partner-badge">
      {label && <span className="partner-badge-label">{label}</span>}
      <Image
        src="/scorpionbits-logo.png"
        alt="ScorpionBits"
        width={size}
        height={size}
        className="partner-badge-logo"
      />
      <span className="partner-badge-name">ScorpionBits</span>
    </div>
  )
}
