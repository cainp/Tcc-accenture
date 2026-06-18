import { Hono } from 'hono'
import { ChatController } from '../controllers/chat.controller.ts'
import { AIService } from '../services/ai.service.ts'
import { getEnv } from '../config/env.ts'

const env = getEnv()
const aiService = new AIService(env.ANTHROPIC_API_KEY, env.SYSTEM_PROMPT)
const chatController = new ChatController(aiService)

export const chatRouter = new Hono().post('/', chatController.handleChat)
