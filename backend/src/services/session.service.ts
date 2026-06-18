import { getRedis } from '../config/redis.ts'

const TTL = 60 * 60 * 24 * 30 // 30 days

export class SessionService {
  async getConversations(sessionId: string): Promise<unknown[]> {
    const redis = getRedis()
    if (!redis) {
      console.warn('[Session] Redis not configured — REDIS_URL missing')
      return []
    }

    try {
      const raw = await redis.get(`session:${sessionId}`)
      if (!raw) return []

      const data = JSON.parse(raw) as { conversations?: unknown[] }
      return Array.isArray(data.conversations) ? data.conversations : []
    } catch (err) {
      console.error('[Session] getConversations failed:', err)
      return []
    }
  }

  async saveConversations(sessionId: string, conversations: unknown[]): Promise<void> {
    const redis = getRedis()
    if (!redis) {
      console.warn('[Session] Redis not configured — REDIS_URL missing')
      return
    }

    try {
      await redis.setex(`session:${sessionId}`, TTL, JSON.stringify({ conversations }))
    } catch (err) {
      console.error('[Session] saveConversations failed:', err)
    }
  }
}
