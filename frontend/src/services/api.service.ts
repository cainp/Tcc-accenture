import type { Message } from '../types/chat'

type ApiMessage = Pick<Message, 'role' | 'content'>

export async function streamChatCompletion(
  messages: ApiMessage[],
  onChunk: (text: string) => void,
  signal?: AbortSignal,
  profile?: string,
): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, ...(profile ? { profile } : {}) }),
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error((error as { error: string }).error ?? `HTTP ${response.status}`)
  }

  if (!response.body) throw new Error('Response body is empty')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let isFirstChunk = true

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value, { stream: true })

    // Cache hits chegam como um único chunk grande (resposta completa de uma vez).
    // Streaming real do Groq envia pequenos chunks distribuídos no tempo.
    // O threshold de 150 chars detecta cache hits e simula digitação para
    // manter a experiência visual consistente entre os dois casos.
    if (isFirstChunk && text.length > 150) {
      // 3 chars a cada 8ms ≈ 375 chars/seg — velocidade que parece digitação natural.
      for (let i = 0; i < text.length; i += 3) {
        if (signal?.aborted) return
        onChunk(text.slice(i, i + 3))
        await new Promise((r) => setTimeout(r, 8))
      }
    } else {
      onChunk(text)
    }

    isFirstChunk = false
  }
}
