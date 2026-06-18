import type { Context } from 'hono'
import type { SessionService } from '../services/session.service.ts'

export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  get = async (c: Context): Promise<Response> => {
    const sessionId = c.req.param('sessionId')
    const conversations = await this.sessionService.getConversations(sessionId)
    return c.json({ conversations })
  }

  save = async (c: Context): Promise<Response> => {
    const sessionId = c.req.param('sessionId')

    let body: { conversations: unknown[] }
    try {
      body = await c.req.json<{ conversations: unknown[] }>()
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400)
    }

    if (!Array.isArray(body.conversations)) {
      return c.json({ error: '"conversations" must be an array' }, 400)
    }

    await this.sessionService.saveConversations(sessionId, body.conversations)
    return c.json({ ok: true })
  }
}
