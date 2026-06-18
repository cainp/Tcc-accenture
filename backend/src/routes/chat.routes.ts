import { Hono } from 'hono'
import { ChatController } from '../controllers/chat.controller.ts'
import { AIService } from '../services/ai.service.ts'
import { RagService } from '../services/rag.service.ts'
import { getEnv } from '../config/env.ts'

const env = getEnv()
const ragService = new RagService()
const aiService = new AIService(env.GROQ_API_KEY, env.SYSTEM_PROMPT, ragService)
const chatController = new ChatController(aiService)

export const chatRouter = new Hono().post('/', chatController.handleChat)
