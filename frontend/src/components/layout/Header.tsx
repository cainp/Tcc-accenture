import type { ReactElement } from 'react'
import diversaLogo from '../../assets/DIversa-logo.svg'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#201F1F]/60 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0">
          <img src={diversaLogo} alt="DIversa" width={72} height={27} style={{ width: 72, height: 27, objectFit: 'contain' }} />
        </div>
        <span className="text-white/20">|</span>
        <span className="text-gray-300 text-sm truncate">{title}</span>
        <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 font-semibold tracking-wide flex-shrink-0">
          ACTIVE
        </span>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <IconButton label="Share">
          <ShareIcon />
        </IconButton>
        <IconButton label="Menu">
          <MenuIcon />
        </IconButton>
      </div>
    </header>
  )
}

function IconButton({
  label,
  children,
}: {
  label: string
  children: ReactElement
}) {
  return (
    <button
      aria-label={label}
      className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
    >
      {children}
    </button>
  )
}

function ShareIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="5" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
    </svg>
  )
}
