import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { chatRouter } from './routes/chat.routes.ts'
import { getEnv } from './config/env.ts'

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

export default {
  port: env.PORT,
  fetch: app.fetch,
}
