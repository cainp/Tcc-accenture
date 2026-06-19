import type { Context } from 'hono'
import { streamText } from 'hono/streaming'
import type { AIService } from '../services/ai.service.ts'
import type { ChatRequestBody } from '../types/chat.ts'

export class ChatController {
  constructor(private readonly aiService: AIService) {}

  handleChat = async (c: Context): Promise<Response> => {
    let body: ChatRequestBody

    try {
      body = await c.req.json<ChatRequestBody>()
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400)
    }

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return c.json({ error: '"messages" must be a non-empty array' }, 400)
    }

    return streamText(c, async (stream) => {
      try {
        for await (const chunk of this.aiService.streamCompletion(body.messages, body.profile)) {
          await stream.write(chunk)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        await stream.write(`\n\n[Error: ${message}]`)
      }
    })
  }
}
