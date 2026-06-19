import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { getRedis } from '../config/redis.ts'

const TTL = 60 * 60 * 24 * 30 // 30 days

const LOCAL_DIR = join(process.cwd(), 'data')
const LOCAL_PATH = join(LOCAL_DIR, 'sessions.json')

type LocalStore = Record<string, { conversations: unknown[] }>

async function readLocal(): Promise<LocalStore> {
  try {
    const raw = await readFile(LOCAL_PATH, 'utf-8')
    return JSON.parse(raw) as LocalStore
  } catch {
    return {}
  }
}

async function writeLocal(store: LocalStore): Promise<void> {
  await mkdir(LOCAL_DIR, { recursive: true })
  await writeFile(LOCAL_PATH, JSON.stringify(store, null, 2), 'utf-8')
}

export class SessionService {
  async getConversations(sessionId: string): Promise<unknown[]> {
    const redis = getRedis()

    if (redis) {
      try {
        const raw = await redis.get(`session:${sessionId}`)
        if (!raw) return []
        const data = JSON.parse(raw) as { conversations?: unknown[] }
        return Array.isArray(data.conversations) ? data.conversations : []
      } catch (err) {
        console.error('[Session] Redis get failed, falling back to local:', err)
      }
    } else {
      console.warn('[Session] Redis unavailable — using local fallback')
    }

    const store = await readLocal()
    return store[sessionId]?.conversations ?? []
  }

  async saveConversations(sessionId: string, conversations: unknown[]): Promise<void> {
    const redis = getRedis()

    if (redis) {
      try {
        await redis.setex(`session:${sessionId}`, TTL, JSON.stringify({ conversations }))
        return
      } catch (err) {
        console.error('[Session] Redis save failed, falling back to local:', err)
      }
    } else {
      console.warn('[Session] Redis unavailable — using local fallback')
    }

    const store = await readLocal()
    store[sessionId] = { conversations }
    await writeLocal(store)
  }
}
