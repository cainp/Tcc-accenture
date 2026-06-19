import type { ChatMessage } from '../types/chat.ts'
import { resolvePreset } from '../config/profiles.ts'

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
        body: JSON.stringify({ query, top_k: 5 }),
        signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) {
        console.error(`[RAG] HTTP ${response.status} for query: "${query}"`)
        return []
      }
      const data = (await response.json()) as { results: RagArticle[] }
      const results = data.results ?? []
      console.log(`[RAG] query="${query}" → ${results.length} artigos (scores: ${results.map((r) => r.score.toFixed(3)).join(', ')})`)
      return results
    } catch (err) {
      console.error(`[RAG] Falha ao recuperar contexto para "${query}":`, err)
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
      `## Artigos Recuperados do Portal Diversa\n\n` +
      `INSTRUÇÃO CRÍTICA: Os artigos abaixo são sua ÚNICA fonte de informação para esta resposta.\n` +
      `- Responda EXCLUSIVAMENTE com base no conteúdo dos artigos abaixo.\n` +
      `- NÃO invente títulos, URLs ou informações que não estejam nos artigos abaixo.\n` +
      `- NÃO diga que não encontrou artigos — os artigos abaixo foram encontrados e DEVEM ser usados.\n` +
      `- Cite o título e a URL exata de cada artigo usado ao final da resposta.\n\n` +
      contextBlock
    )
  }

  async *streamCompletion(messages: ChatMessage[], profile?: string): AsyncGenerator<string> {
    const preset = resolvePreset(profile)

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
        temperature: preset.temperature,
        max_tokens: preset.max_tokens,
        top_p: preset.top_p,
        frequency_penalty: preset.frequency_penalty,
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
