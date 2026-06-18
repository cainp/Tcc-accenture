import Anthropic from '@anthropic-ai/sdk'
import type { ChatMessage } from '../types/chat.ts'

export class AIService {
  private readonly client: Anthropic

  constructor(
    apiKey: string,
    private readonly systemPrompt: string,
    private readonly model: string = 'claude-sonnet-4-6',
  ) {
    this.client = new Anthropic({ apiKey })
  }

  /**
   * Stub for semantic search / RAG retrieval.
   * Replace with a real vector DB call (Pinecone, Weaviate, pgvector, etc.)
   */
  private async retrieveContext(_query: string): Promise<string> {
    return ''
  }

  async *streamCompletion(messages: ChatMessage[]): AsyncGenerator<string> {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')

    const context = lastUserMessage
      ? await this.retrieveContext(lastUserMessage.content)
      : ''

    const systemWithContext = context
      ? `${this.systemPrompt}\n\n<context>\n${context}\n</context>`
      : this.systemPrompt

    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: 2048,
      system: systemWithContext,
      messages: messages.map(({ role, content }) => ({ role, content })),
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text
      }
    }
  }
}
