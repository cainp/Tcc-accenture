import { useEffect, useRef } from 'react'
import { useChatStore } from '../store/chat.store'
import { getSessionId, loadSession, saveSession } from '../services/session.service'

export function useSession() {
  const { conversations, isStreaming, initConversations, createConversation } =
    useChatStore()

  const sessionId = useRef(getSessionId())
  const ready = useRef(false)
  // set to true synchronously in the .then() before React re-renders,
  // so the first save effect after hydration can detect and skip the no-op save
  const justLoaded = useRef(false)

  useEffect(() => {
    loadSession(sessionId.current).then((saved) => {
      if (saved.length > 0) {
        initConversations(saved)
      } else {
        createConversation()
      }
      justLoaded.current = true
      ready.current = true
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready.current || isStreaming) return
    if (justLoaded.current) {
      // Skip the first save after hydration — the data is already in Redis
      // and we must not overwrite it with an empty conversation if the load
      // returned [] due to a transient Redis error
      justLoaded.current = false
      return
    }
    saveSession(sessionId.current, conversations)
  }, [conversations, isStreaming])
}
