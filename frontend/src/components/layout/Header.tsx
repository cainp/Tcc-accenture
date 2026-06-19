import diversaLogo from '../../assets/DIversa-logo.svg'
import ediLogo from '../../assets/edi-logo.svg'

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
        <div className="flex-shrink-0">
          <img src={ediLogo} alt="EDI" width={32.23} height={20.72} style={{ width: 32.23, height: 20.72, objectFit: 'contain' }} />
        </div>
        <span className="text-white/20">|</span>
        <ArticleIcon />
        <span className="text-gray-300 text-sm truncate">{title}</span>
        <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 font-semibold tracking-wide flex-shrink-0">
          ACTIVE
        </span>
      </div>

    </header>
  )
}

function ArticleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-gray-400 flex-shrink-0"
    >
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  )
}

