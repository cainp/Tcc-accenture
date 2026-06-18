export interface Env {
  ANTHROPIC_API_KEY: string
  PORT: number
  FRONTEND_URL: string
  SYSTEM_PROMPT: string
}

export function getEnv(): Env {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Missing required env var: ANTHROPIC_API_KEY')
  }

  return {
    ANTHROPIC_API_KEY,
    PORT: Number(process.env.PORT ?? 3000),
    FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    SYSTEM_PROMPT:
      process.env.SYSTEM_PROMPT ??
      'You are a helpful AI assistant. Be concise, clear, and accurate.',
  }
}
