import { useState, useRef, type KeyboardEvent } from 'react'

interface MessageInputProps {
  onSend: (text: string) => void
  onStop: () => void
  isStreaming: boolean
  disabled: boolean
}

export function MessageInput({
  onSend,
  onStop,
  isStreaming,
  disabled,
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
      <div className="flex items-end gap-2 bg-[#201F1F] border border-white/10 rounded-2xl px-3 py-2.5 focus-within:border-[#A100FF]/50 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Message accure…"
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 resize-none outline-none leading-relaxed py-1 max-h-[200px] disabled:cursor-not-allowed"
        />

        <button
          onClick={isStreaming ? onStop : handleSend}
          disabled={disabled || (!isStreaming && !value.trim())}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#A100FF] hover:bg-[#B800FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white text-sm font-medium flex-shrink-0"
        >
          {isStreaming ? (
            <>
              <StopIcon />
              Stop
            </>
          ) : (
            <>
              Send
              <SendArrowIcon />
            </>
          )}
        </button>
      </div>

      <p className="text-center text-[11px] text-gray-600 mt-2">
        accure can make mistakes. Consider verifying important information.
      </p>
    </div>
  )
}

function SendArrowIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
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
