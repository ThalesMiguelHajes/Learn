function getInitials(name, fallback = '?') {
  if (!name) return fallback
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

export default function Avatar({ name, fallback = '?', size, className = '' }) {
  const initials = getInitials(name, fallback)
  return (
    <div
      className={`avatar ${className}`}
      style={size ? { width: size, height: size, fontSize: `${size * 0.32}px` } : undefined}
    >
      {initials}
    </div>
  )
}
