import { Redis } from 'ioredis'

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 dias
// 500 entradas é o teto antes de parar de armazenar. Não há evicção ativa porque
// isso exigiria lógica LRU; o TTL cuida da limpeza passiva ao longo do tempo.
const MAX_CACHE_ENTRIES = 500
const COHERE_EMBED_URL = 'https://api.cohere.com/v2/embed'

interface CacheEntry<T> {
  query: string
  embedding: number[]
  value: T
}

interface CohereEmbedResponse {
  embeddings: { float: number[][] }
}

export class SemanticCacheService<T> {
  private redis: Redis
  private readonly indexKey: string
  private readonly keyPrefix: string

  constructor(
    redisUrl: string,
    private readonly cohereApiKey: string,
    namespace: string,
    // 0.82 calibrado empiricamente: captura variações de escrita da mesma pergunta
    // sem aceitar perguntas apenas relacionadas ao tema (ex: 0.75 causava falsos positivos).
    private readonly threshold = 0.82,
  ) {
    // Namespace no prefixo das chaves isola RAG, LLM-professor, LLM-familia etc.
    // na mesma instância Redis sem risco de colisão.
    this.indexKey = `sem_cache:${namespace}:index`
    this.keyPrefix = `sem_cache:${namespace}`

    this.redis = new Redis(redisUrl, {
      retryStrategy(times) {
        if (times > 3) return null
        return Math.min(times * 500, 2000)
      },
    })

    this.redis.on('error', (err: NodeJS.ErrnoException) => {
      console.error(`[SemanticCache:${namespace}] Redis error:`, err.message)
    })

    this.redis.on('ready', () => {
      console.log(`[SemanticCache:${namespace}] Redis conectado`)
    })
  }

  private async embed(text: string): Promise<number[]> {
    const response = await fetch(COHERE_EMBED_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.cohereApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: [text],
        model: 'embed-multilingual-v3.0',
        input_type: 'search_query',
        embedding_types: ['float'],
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`Cohere embed error ${response.status}: ${await response.text()}`)
    }

    const data = (await response.json()) as CohereEmbedResponse
    const embedding = data.embeddings.float[0]
    if (!embedding) throw new Error('Cohere returned no embedding')
    return embedding
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0
    for (let i = 0; i < a.length; i++) {
      const ai = a[i] ?? 0
      const bi = b[i] ?? 0
      dot += ai * bi
      normA += ai * ai
      normB += bi * bi
    }
    if (normA === 0 || normB === 0) return 0
    return dot / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  async get(query: string): Promise<T | null> {
    try {
      const keys = await this.redis.smembers(this.indexKey)
      if (keys.length === 0) return null

      // Embedding e busca no Redis em paralelo para economizar latência.
      const [queryEmbedding, rawValues] = await Promise.all([
        this.embed(query),
        this.redis.mget(...keys),
      ])

      const expiredKeys: string[] = []
      let bestScore = 0
      let bestEntry: CacheEntry<T> | null = null

      for (let i = 0; i < keys.length; i++) {
        const raw = rawValues[i] ?? null
        if (!raw) {
          // Chave expirou pelo TTL mas ainda está no Set de índice.
          // Acumulamos para limpar de forma lazy após o loop.
          expiredKeys.push(keys[i])
          continue
        }
        const entry = JSON.parse(raw) as CacheEntry<T>
        const score = this.cosineSimilarity(queryEmbedding, entry.embedding)
        if (score > bestScore) {
          bestScore = score
          bestEntry = entry
        }
      }

      if (expiredKeys.length > 0) {
        this.redis.srem(this.indexKey, ...expiredKeys).catch(() => {})
      }

      if (bestScore >= this.threshold && bestEntry) {
        console.log(`[SemanticCache] HIT score=${bestScore.toFixed(3)} query="${query}"`)
        return bestEntry.value
      }

      console.log(`[SemanticCache] MISS best_score=${bestScore.toFixed(3)} query="${query}"`)
      return null
    } catch (err) {
      console.error('[SemanticCache] get error:', err)
      return null
    }
  }

  async set(query: string, value: T): Promise<void> {
    try {
      const size = await this.redis.scard(this.indexKey)
      if (size >= MAX_CACHE_ENTRIES) {
        console.log(`[SemanticCache] Cache cheio (${size} entradas), pulando`)
        return
      }

      const embedding = await this.embed(query)
      const key = `${this.keyPrefix}:${crypto.randomUUID()}`
      const entry: CacheEntry<T> = { query, embedding, value }

      await this.redis.set(key, JSON.stringify(entry), 'EX', CACHE_TTL_SECONDS)
      await this.redis.sadd(this.indexKey, key)
      console.log(`[SemanticCache] STORED query="${query}"`)
    } catch (err) {
      console.error('[SemanticCache] set error:', err)
    }
  }

  async disconnect(): Promise<void> {
    await this.redis.quit()
  }
}
