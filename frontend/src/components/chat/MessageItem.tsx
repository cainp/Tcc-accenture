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
      <div className="flex-1 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap pt-1">
        {message.content || <Cursor />}
      </div>
    </div>
  )
}

function Cursor() {
  return (
    <span className="inline-block w-2 h-4 bg-[#A100FF] animate-pulse rounded-sm" />
  )
}
