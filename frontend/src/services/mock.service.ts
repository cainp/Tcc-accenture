const RESPONSES = [
  `Olá! Sou o **accure**, seu assistente. Posso ajudar com código, escrita, análise e muito mais.

Pode digitar sua pergunta e eu responderei em tempo real, palavra por palavra, exatamente como você está vendo agora.`,

  `Boa pergunta! Aqui vai uma resposta de exemplo para demonstrar o efeito de streaming:

\`\`\`typescript
function greet(name: string): string {
  return \`Olá, \${name}!\`
}

console.log(greet('Mundo'))
\`\`\`

O texto aparece progressivamente, simulando a geração real do modelo de linguagem.`,

  `Entendi o que você quer dizer. Vamos pensar juntos nisso.

Existem algumas abordagens possíveis:

1. **Primeira opção** — simples e direta, boa para protótipos.
2. **Segunda opção** — mais robusta, recomendada para produção.
3. **Terceira opção** — equilibra complexidade e performance.

Me diga qual direção faz mais sentido para o seu caso.`,

  `Claro! Aqui está um resumo conciso sobre o assunto.

O ponto central é que a clareza sempre supera a complexidade desnecessária. Código bem escrito se explica sozinho — comentários são para o *porquê*, não para o *o quê*.

Qualquer dúvida é só perguntar.`,
]

type ChatMessage = { role: string; content: string }

export async function streamChatCompletion(
  _messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const text = RESPONSES[Math.floor(Math.random() * RESPONSES.length)]

  for (const char of text) {
    if (signal?.aborted) break
    await new Promise((resolve) =>
      setTimeout(resolve, char === ' ' ? 18 : 8 + Math.random() * 12),
    )
    onChunk(char)
  }
}
