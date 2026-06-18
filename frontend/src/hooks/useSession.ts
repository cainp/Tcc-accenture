import { useEffect, useRef } from 'react'
import { useChatStore } from '../store/chat.store'
import { getSessionId, loadSession, saveSession } from '../services/session.service'

export function useSession() {
  const { conversations, isStreaming, initConversations, createConversation } =
    useChatStore()

  const sessionId = useRef(getSessionId())
  const ready = useRef(false)

  useEffect(() => {
    loadSession(sessionId.current).then((saved) => {
      if (saved.length > 0) {
        initConversations(saved)
      } else {
        createConversation()
      }
      ready.current = true
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready.current || isStreaming) return
    saveSession(sessionId.current, conversations)
  }, [conversations, isStreaming])
}
