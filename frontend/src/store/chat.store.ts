import { create } from 'zustand'
import type { Conversation, Message } from '../types/chat'

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  isStreaming: boolean

  initConversations: (conversations: Conversation[]) => void
  createConversation: () => void
  setActiveConversation: (id: string) => void
  addMessage: (conversationId: string, message: Message) => void
  appendToLastMessage: (conversationId: string, text: string) => void
  updateConversationTitle: (id: string, title: string) => void
  setStreaming: (value: boolean) => void
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  isStreaming: false,

  initConversations: (conversations) =>
    set({ conversations, activeConversationId: conversations[0]?.id ?? null }),

  createConversation: () => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    }
    set((s) => ({
      conversations: [...s.conversations, newConv],
      activeConversationId: newConv.id,
    }))
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addMessage: (conversationId, message) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message] }
          : c,
      ),
    })),

  appendToLastMessage: (conversationId, text) =>
    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== conversationId) return c
        const messages = [...c.messages]
        const last = messages[messages.length - 1]
        if (last && last.role === 'assistant') {
          messages[messages.length - 1] = {
            ...last,
            content: last.content + text,
          }
        }
        return { ...c, messages }
      }),
    })),

  updateConversationTitle: (id, title) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, title } : c,
      ),
    })),

  setStreaming: (value) => set({ isStreaming: value }),
}))
