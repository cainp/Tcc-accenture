import { useState, useRef, useEffect, type KeyboardEvent } from 'react'

type UserProfile = 'professor' | 'familia' | 'gestor'

const PROFILES: { value: UserProfile; label: string }[] = [
  { value: 'professor', label: 'Professor' },
  { value: 'familia',   label: 'Família'   },
  { value: 'gestor',    label: 'Gestor'    },
]

interface MessageInputProps {
  onSend: (text: string) => void
  onStop: () => void
  isStreaming: boolean
  disabled: boolean
  profile?: UserProfile
  onProfileChange: (profile: UserProfile | undefined) => void
}

export function MessageInput({
  onSend,
  onStop,
  isStreaming,
  disabled,
  profile,
  onProfileChange,
}: MessageInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const text = value.trim()
    if (!text || disabled || isStreaming) return
    onSend(text)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  return (
    <div className="px-6 pb-5 flex-shrink-0">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2 bg-[#201F1F] border border-white/10 rounded-2xl px-3 py-2.5 focus-within:border-[#A100FF]/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Peça ao Edi..."
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 resize-none outline-none leading-relaxed py-1 max-h-[200px] disabled:cursor-not-allowed"
          />

          <ProfileSelector value={profile} onChange={onProfileChange} />

          <button
            onClick={isStreaming ? onStop : handleSend}
            disabled={disabled || (!isStreaming && !value.trim())}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#A100FF] hover:bg-[#B800FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white text-sm font-medium flex-shrink-0"
          >
            {isStreaming ? (
              <>
                <StopIcon />
                Parar
              </>
            ) : (
              <>
                Enviar
                <SendArrowIcon />
              </>
            )}
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-600 mt-2">
          O Edi AI pode cometer erros. Considere verificar informações importantes.
        </p>
      </div>
    </div>
  )
}

interface ProfileSelectorProps {
  value?: UserProfile
  onChange: (profile: UserProfile | undefined) => void
}

function ProfileSelector({ value, onChange }: ProfileSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentLabel = PROFILES.find((p) => p.value === value)?.label ?? 'Perfil'

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 text-gray-300 hover:text-white text-sm font-medium transition-colors"
      >
        {currentLabel}
        <ChevronDownIcon open={open} />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 min-w-[130px] bg-[#2a2a2a] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
          {PROFILES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => { onChange(p.value); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                value === p.value ? 'text-[#A100FF] font-medium' : 'text-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
          {value && (
            <button
              type="button"
              onClick={() => { onChange(undefined); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors border-t border-white/5"
            >
              Padrão
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function SendArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="16px"
      viewBox="0 -960 960 960"
      width="16px"
      className="fill-current"
    >
      <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  )
}
