import { useCallback, useRef } from 'react'
import { useChatStore } from '../store/chat.store'
import { streamChatCompletion } from '../services/api.service'
import type { Message } from '../types/chat'

export function useChat() {
  const {
    conversations,
    activeConversationId,
    isStreaming,
    addMessage,
    appendToLastMessage,
    updateConversationTitle,
    deleteConversation,
    setStreaming,
    createConversation,
    setActiveConversation,
  } = useChatStore()

  const abortRef = useRef<AbortController | null>(null)

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  )

  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId || isStreaming) return

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        createdAt: new Date(),
      }

      // Auto-title the conversation from the first user message
      if (activeConversation?.messages.length === 0) {
        updateConversationTitle(
          activeConversationId,
          text.slice(0, 42) + (text.length > 42 ? '…' : ''),
        )
      }

      addMessage(activeConversationId, userMessage)

      const assistantPlaceholder: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      }
      addMessage(activeConversationId, assistantPlaceholder)
      setStreaming(true)

      abortRef.current = new AbortController()

      const history = [
        ...(activeConversation?.messages ?? []),
        userMessage,
      ].map(({ role, content }) => ({ role, content }))

      try {
        await streamChatCompletion(
          history,
          (chunk) => appendToLastMessage(activeConversationId, chunk),
          abortRef.current.signal,
        )
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          appendToLastMessage(
            activeConversationId,
            `\n\n*Error: ${err.message}*`,
          )
        }
      } finally {
        setStreaming(false)
      }
    },
    [
      activeConversationId,
      isStreaming,
      activeConversation,
      addMessage,
      appendToLastMessage,
      updateConversationTitle,
      setStreaming,
    ],
  )

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return {
    conversations,
    activeConversation,
    activeConversationId,
    isStreaming,
    sendMessage,
    stopStreaming,
    createConversation,
    setActiveConversation,
    renameConversation: updateConversationTitle,
    deleteConversation,
  }
}
