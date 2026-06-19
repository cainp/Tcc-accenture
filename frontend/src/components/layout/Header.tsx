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
        <DescriptionIcon />
        <span className="text-gray-300 text-sm truncate">{title}</span>
      </div>
    </header>
  )
}

function DescriptionIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="18px"
      viewBox="0 -960 960 960"
      width="18px"
      className="text-gray-400 flex-shrink-0 fill-current"
    >
      <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z" />
    </svg>
  )
}
