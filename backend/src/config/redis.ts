import { Redis } from 'ioredis'

let client: Redis | null = null
let unavailable = false

export function getRedis(): Redis | null {
  const url = process.env.REDIS_URL
  if (!url || unavailable) return null

  if (!client) {
    client = new Redis(url, {
      retryStrategy(times) {
        if (unavailable || times > 3) return null
        return Math.min(times * 500, 2000)
      },
    })

    client.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        if (!unavailable) {
          unavailable = true
          console.warn('[Redis] Host unreachable — sessions will be stored locally')
          client?.disconnect()
        }
        return
      }
      console.error('[Redis]', err.message)
    })

    client.on('ready', () => {
      unavailable = false
    })
  }

  return client
}
