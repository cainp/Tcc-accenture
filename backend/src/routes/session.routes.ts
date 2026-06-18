import { Hono } from 'hono'
import { SessionController } from '../controllers/session.controller.ts'
import { SessionService } from '../services/session.service.ts'

const sessionController = new SessionController(new SessionService())

export const sessionRouter = new Hono()
  .get('/:sessionId', sessionController.get)
  .put('/:sessionId', sessionController.save)
