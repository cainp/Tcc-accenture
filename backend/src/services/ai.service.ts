import type { ChatMessage } from '../types/chat.ts'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-8b-instant'

interface RagArticle {
  titulo: string
  texto: string
  url: string
  categoria: string
  score: number
}

export class AIService {
  constructor(
    private readonly apiKey: string,
    private readonly systemPrompt: string,
    private readonly ragServiceUrl: string,
  ) {}

  private async retrieveContext(query: string): Promise<RagArticle[]> {
    try {
      const response = await fetch(`${this.ragServiceUrl}/retrieve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: 3 }),
        signal: AbortSignal.timeout(3000),
      })
      if (!response.ok) return []
      const data = (await response.json()) as { results: RagArticle[] }
      return data.results ?? []
    } catch {
      return []
    }
  }

  private buildSystemPromptWithContext(context: RagArticle[]): string {
    if (context.length === 0) return this.systemPrompt

    const contextBlock = context
      .map(
        (r, i) =>
          `### Artigo ${i + 1}: ${r.titulo}\n${r.texto}\nFonte: ${r.url}`,
      )
      .join('\n\n---\n\n')

    return (
      `${this.systemPrompt}\n\n` +
      `## Contexto Relevante (artigos do Diversa)\n\n` +
      `Use as informações abaixo para embasar sua resposta. Cite a fonte quando pertinente.\n\n` +
      contextBlock
    )
  }

  async *streamCompletion(messages: ChatMessage[]): AsyncGenerator<string> {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    const context = lastUserMsg
      ? await this.retrieveContext(lastUserMsg.content)
      : []
    const systemPrompt = this.buildSystemPromptWithContext(context)

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.3,
        max_tokens: 1024,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(({ role, content }) => ({ role, content })),
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Groq API error ${response.status}: ${err}`)
    }

    if (!response.body) throw new Error('No response body from Groq')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (!trimmed.startsWith('data: ')) continue
        try {
          const json = JSON.parse(trimmed.slice(6))
          const content = json.choices?.[0]?.delta?.content
          if (content) yield content
        } catch {
          // skip malformed SSE chunks
        }
      }
    }
  }
}
