export type MessageRole = 'user' | 'assistant'

export type UserProfile = 'professor' | 'familia' | 'gestor'

export interface Message {
  id: string
  role: MessageRole
  content: string
  createdAt: Date
  profile?: UserProfile
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}
