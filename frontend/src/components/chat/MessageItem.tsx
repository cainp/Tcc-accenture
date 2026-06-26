import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message, UserProfile } from '../../types/chat'
import { AccureArrow } from '../ui/Logo'

const PROFILE_LABELS: Record<UserProfile, string> = {
  professor: 'Perfil: Professor',
  familia: 'Perfil: Família',
  gestor: 'Perfil: Gestor',
}

interface MessageItemProps {
  message: Message
  isStreaming?: boolean
}

// Buffers incoming content and drains it at a fixed character rate so streaming
// chunks appear as smooth typing instead of sudden blocks.
function useTypingAnimation(content: string, active: boolean): string {
  const [displayed, setDisplayed] = useState(() => (active ? '' : content))
  const ref = useRef({ content, len: active ? 0 : content.length })
  ref.current.content = content

  useEffect(() => {
    if (!active) {
      // Stream terminou: revela o conteúdo restante de uma vez para evitar
      // que o intervalo continue animando após o assistente parar de responder.
      setDisplayed(ref.current.content)
      ref.current.len = ref.current.content.length
      return
    }

    ref.current.len = 0
    setDisplayed('')

    const id = setInterval(() => {
      const { content: target, len } = ref.current
      if (len >= target.length) return
      const next = Math.min(len + 2, target.length)
      ref.current.len = next
      setDisplayed(target.slice(0, next))
    }, 16) // ~2 chars per frame at 60 fps ≈ 125 chars/s

    return () => clearInterval(id)
  }, [active])

  return displayed
}

export function MessageItem({ message, isStreaming = false }: MessageItemProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm bg-[#2a2a2a] text-white text-base leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  const displayed = useTypingAnimation(message.content, isStreaming)

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-[#201F1F] border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <AccureArrow size={13} />
      </div>
      <div className="flex-1 text-base text-gray-200 leading-relaxed pt-1">
        {displayed ? (
          <>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    {children}
                  </a>
                ),
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
              }}
            >
              {displayed}
            </ReactMarkdown>
            {isStreaming && <Cursor />}
          </>
        ) : (
          <Cursor />
        )}
        {!isStreaming && message.profile && (
          <p className="text-xs text-gray-600 mt-3">
            {PROFILE_LABELS[message.profile]}
          </p>
        )}
      </div>
    </div>
  )
}

function Cursor() {
  return (
    <span className="inline-block w-2 h-4 bg-[#A100FF] animate-pulse rounded-sm" />
  )
}
