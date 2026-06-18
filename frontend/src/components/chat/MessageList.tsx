import { useEffect, useRef } from 'react'
import { MessageItem } from './MessageItem'
import type { Message } from '../../types/chat'

interface MessageListProps {
  messages: Message[]
  isStreaming: boolean
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastMsgId = messages[messages.length - 1]?.id

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="h-full overflow-y-auto px-6 py-6 space-y-6">
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          isStreaming={isStreaming && msg.id === lastMsgId && msg.role === 'assistant'}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
