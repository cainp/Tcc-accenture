import { Redis } from 'ioredis'

let client: Redis | null = null

export function getRedis(): Redis | null {
  const url = process.env.REDIS_URL
  if (!url) return null

  if (!client) {
    client = new Redis(url)
    client.on('error', (err) => console.error('[Redis]', err.message))
  }

  return client
}
