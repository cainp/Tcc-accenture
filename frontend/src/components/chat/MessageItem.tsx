import ReactMarkdown from 'react-markdown'
import type { Message } from '../../types/chat'
import { AccureArrow } from '../ui/Logo'

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm bg-[#2a2a2a] text-white text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-[#201F1F] border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <AccureArrow size={13} />
      </div>
      <div className="flex-1 text-sm text-gray-200 leading-relaxed pt-1">
        {message.content ? (
          <ReactMarkdown
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
            {message.content}
          </ReactMarkdown>
        ) : (
          <Cursor />
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
