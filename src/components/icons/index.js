// Conjunto de ícones em SVG, consistentes com o estilo já usado no botão de logout
// (stroke currentColor, cantos arredondados). Substitui o uso de emojis como ícone.

function Icon({ children, size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconSearch(props) {
  return <Icon {...props}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>
}

export function IconDashboard(props) {
  return <Icon {...props}><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></Icon>
}

export function IconWallet(props) {
  return <Icon {...props}><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3" /><path d="M3 7v10a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-4a2 2 0 0 0 0 4h5" /></Icon>
}

export function IconBooks(props) {
  return <Icon {...props}><path d="M4 4v16a1 1 0 0 0 1 1h4V3H5a1 1 0 0 0-1 1Z" /><path d="M11 3h5a1 1 0 0 1 1 1v17h-6z" /><path d="M19.5 5.4 22 19.2a1 1 0 0 1-.8 1.16l-2 .36" /></Icon>
}

export function IconBookOpen(props) {
  return <Icon {...props}><path d="M12 21V7a4 4 0 0 0-4-4H3v16h5a4 4 0 0 1 4 4Z" /><path d="M12 21V7a4 4 0 0 1 4-4h5v16h-5a4 4 0 0 0-4 4Z" /></Icon>
}

export function IconUsers(props) {
  return <Icon {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>
}

export function IconLink(props) {
  return <Icon {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></Icon>
}

export function IconFileText(props) {
  return <Icon {...props}><path d="M14.5 2H6a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5Z" /><path d="M14 2v6h6" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></Icon>
}

export function IconImage(props) {
  return <Icon {...props}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></Icon>
}

export function IconEdit(props) {
  return <Icon {...props}><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></Icon>
}

export function IconTrash(props) {
  return <Icon {...props}><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></Icon>
}

export function IconX(props) {
  return <Icon {...props}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
}

export function IconCheck(props) {
  return <Icon {...props}><polyline points="20 6 9 17 4 12" /></Icon>
}

export function IconCheckCircle(props) {
  return <Icon {...props}><circle cx="12" cy="12" r="10" /><path d="m8.5 12.5 2.5 2.5 5-5" /></Icon>
}

export function IconClock(props) {
  return <Icon {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon>
}

export function IconMail(props) {
  return <Icon {...props}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" /></Icon>
}

export function IconFolder(props) {
  return <Icon {...props}><path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /></Icon>
}

export function IconFolderPlus(props) {
  return <Icon {...props}><path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /><line x1="12" y1="11" x2="12" y2="15" /><line x1="10" y1="13" x2="14" y2="13" /></Icon>
}

export function IconCart(props) {
  return <Icon {...props}><circle cx="9" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6" /></Icon>
}

export function IconDownload(props) {
  return <Icon {...props}><path d="M12 3v12" /><polyline points="7 11 12 16 17 11" /><path d="M5 20h14" /></Icon>
}

export function IconArrowLeft(props) {
  return <Icon {...props}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon>
}

export function IconArrowRight(props) {
  return <Icon {...props}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
}

export function IconLock(props) {
  return <Icon {...props}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Icon>
}

export function IconZap(props) {
  return <Icon {...props}><polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2" /></Icon>
}

export function IconPlus(props) {
  return <Icon {...props}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>
}

export function IconSun(props) {
  return <Icon {...props}><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="4.2" y1="4.2" x2="5.6" y2="5.6" /><line x1="18.4" y1="18.4" x2="19.8" y2="19.8" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /><line x1="4.2" y1="19.8" x2="5.6" y2="18.4" /><line x1="18.4" y1="5.6" x2="19.8" y2="4.2" /></Icon>
}

export function IconMoon(props) {
  return <Icon {...props}><path d="M21 12.5A8.5 8.5 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5Z" /></Icon>
}

export function IconSettings(props) {
  return <Icon {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z" /></Icon>
}

export function IconEye(props) {
  return <Icon {...props}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" /></Icon>
}

export function IconEyeOff(props) {
  return <Icon {...props}><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a13.2 13.2 0 0 1-3.19 4.14M6.1 6.1C3.4 7.8 1 12 1 12a13.2 13.2 0 0 0 6.1 5.9M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></Icon>
}

export function IconDevices(props) {
  return <Icon {...props}><rect x="2" y="4" width="14" height="10" rx="1" /><line x1="6" y1="18" x2="12" y2="18" /><rect x="17" y="9" width="5" height="9" rx="1" /></Icon>
}
