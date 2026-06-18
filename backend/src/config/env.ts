import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

export interface Env {
  GROQ_API_KEY: string
  PORT: number
  FRONTEND_URL: string
  SYSTEM_PROMPT: string
}

function loadSystemPrompt(): string {
  const filePath = join(process.cwd(), 'SYSTEM_PROMPT.md')
  if (existsSync(filePath)) {
    return readFileSync(filePath, 'utf-8').trim()
  }
  return process.env.SYSTEM_PROMPT ?? 'You are a helpful AI assistant. Be concise, clear, and accurate.'
}

export function getEnv(): Env {
  const GROQ_API_KEY = process.env.GROQ_API_KEY
  if (!GROQ_API_KEY) {
    throw new Error('Missing required env var: GROQ_API_KEY')
  }

  return {
    GROQ_API_KEY,
    PORT: Number(process.env.PORT ?? 3000),
    FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    SYSTEM_PROMPT: loadSystemPrompt(),
  }
}
