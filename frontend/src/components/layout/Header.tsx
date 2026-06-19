import diversaLogo from '../../assets/DIversa-logo.svg'
import ediLogo from '../../assets/edi-logo.svg'

export function Header() {
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
      </div>
    </header>
  )
}
