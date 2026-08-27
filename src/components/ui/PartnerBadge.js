export default function PartnerBadge({ label, size = 20 }) {
  return (
    <div className="partner-badge">
      {label && <span className="partner-badge-label">{label}</span>}
      <img
        src="/scorpionbits-logo.png"
        alt="ScorpionBits"
        className="partner-badge-logo"
        style={{ width: size, height: size }}
      />
      <span className="partner-badge-name">ScorpionBits</span>
    </div>
  )
}
