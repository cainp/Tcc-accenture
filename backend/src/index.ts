import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { chatRouter } from './routes/chat.routes.ts'
import { getEnv } from './config/env.ts'
import { join } from 'node:path'

const env = getEnv()
const app = new Hono()

app.use('*', logger())
app.use(
  '/api/*',
  cors({
    origin: env.FRONTEND_URL,
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
)

app.route('/api/chat', chatRouter)
app.get('/health', (c) => c.json({ status: 'ok' }))

// Serve frontend static files in production
const distPath = join(import.meta.dir, '../../frontend/dist')

app.get('*', async (c) => {
  const url = new URL(c.req.url)
  const filePath = join(distPath, url.pathname)
  const file = Bun.file(filePath)

  if (await file.exists()) {
    return new Response(file)
  }

  // SPA fallback — always return index.html for unknown routes
  const index = Bun.file(join(distPath, 'index.html'))
  if (await index.exists()) {
    return new Response(index, { headers: { 'Content-Type': 'text/html' } })
  }

  return c.text('Not found', 404)
})

export default {
  port: env.PORT,
  fetch: app.fetch,
}
