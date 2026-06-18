export type MessageRole = 'user' | 'assistant'

export interface ChatMessage {
  role: MessageRole
  content: string
}

export interface ChatRequestBody {
  messages: ChatMessage[]
}
