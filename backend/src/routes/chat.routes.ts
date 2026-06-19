import { Hono } from 'hono'
import { ChatController } from '../controllers/chat.controller.ts'
import { AIService, type RagArticle } from '../services/ai.service.ts'
import { SemanticCacheService } from '../services/semantic-cache.service.ts'
import { getEnv } from '../config/env.ts'

const env = getEnv()

let ragCache: SemanticCacheService<RagArticle[]> | undefined
let llmCaches: Map<string, SemanticCacheService<string>> | undefined

if (env.REDIS_URL && env.COHERE_API_KEY) {
  ragCache = new SemanticCacheService(env.REDIS_URL, env.COHERE_API_KEY, 'rag')

  llmCaches = new Map()
  for (const profile of ['professor', 'familia', 'gestor', 'default']) {
    llmCaches.set(
      profile,
      new SemanticCacheService(env.REDIS_URL, env.COHERE_API_KEY, `llm-${profile}`),
    )
  }
}

const aiService = new AIService(env.GROQ_API_KEY, env.SYSTEM_PROMPT, env.RAG_SERVICE_URL, ragCache, llmCaches)
const chatController = new ChatController(aiService)

export const chatRouter = new Hono().post('/', chatController.handleChat)
