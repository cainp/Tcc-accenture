import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface RagArticle {
  titulo: string
  texto: string
  url: string
  categoria: string
  tema: string[]
  tipo_conteudo: string
  score: number
}

interface RawArticle {
  titulo: string
  texto?: string
  url?: string
  categoria?: string
  tema?: string[]
  tipo_conteudo?: string
}

// Tokens de 2+ caracteres de palavra (unicode, cobre acentos do PT-BR),
// equivalente ao token_pattern padrão do TfidfVectorizer do sklearn.
const TOKEN_RE = /[0-9_\p{L}]{2,}/gu
const MAX_FEATURES = 10_000
const NGRAM_MAX = 2

// Metadados curados (tema/tipo_conteudo) são sinal forte de tópico, então
// entram na indexação com peso maior — equivale a repetir seus termos.
const META_BOOST = 3

type Vector = Map<number, number>

function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(TOKEN_RE)
  if (!words) return []

  // Unigramas + bigramas (ngram_range = (1, 2)).
  const terms: string[] = [...words]
  for (let n = 2; n <= NGRAM_MAX; n++) {
    for (let i = 0; i + n <= words.length; i++) {
      terms.push(words.slice(i, i + n).join(' '))
    }
  }
  return terms
}

function dot(a: Vector, b: Vector): number {
  const [small, large] = a.size <= b.size ? [a, b] : [b, a]
  let sum = 0
  for (const [idx, weight] of small) {
    const other = large.get(idx)
    if (other !== undefined) sum += weight * other
  }
  return sum
}

/**
 * Recuperação por TF-IDF + similaridade de cosseno, em memória.
 * Porta o comportamento do antigo serviço Python (backend/rag/main.py):
 * sublinear_tf, smooth_idf, normalização L2 e ngram (1, 2).
 */
export class RagService {
  private readonly articles: RawArticle[]
  private readonly vocab: Map<string, number>
  private readonly idf: number[]
  private readonly docVectors: Vector[]

  constructor(dataPath?: string) {
    const path =
      dataPath ?? join(import.meta.dir, '../../data/artigos_diversa (2).json')
    this.articles = JSON.parse(readFileSync(path, 'utf-8')) as RawArticle[]

    const docTerms = this.articles.map((a) => {
      const base = tokenize(`${a.titulo} ${a.texto ?? ''}`)
      // tema/tipo_conteudo tokenizados à parte e repetidos META_BOOST vezes.
      const metaTerms = tokenize(
        [...(a.tema ?? []), a.tipo_conteudo ?? ''].join(' '),
      )
      for (let k = 0; k < META_BOOST; k++) base.push(...metaTerms)
      return base
    })

    // Frequência total (pra max_features) e documental (pra IDF).
    const totalFreq = new Map<string, number>()
    const docFreq = new Map<string, number>()
    for (const terms of docTerms) {
      const seen = new Set<string>()
      for (const term of terms) {
        totalFreq.set(term, (totalFreq.get(term) ?? 0) + 1)
        if (!seen.has(term)) {
          seen.add(term)
          docFreq.set(term, (docFreq.get(term) ?? 0) + 1)
        }
      }
    }

    // Mantém os MAX_FEATURES termos mais frequentes (como o sklearn).
    const kept = [...totalFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_FEATURES)
      .map(([term]) => term)
    this.vocab = new Map(kept.map((term, i) => [term, i]))

    const n = this.articles.length
    this.idf = new Array(this.vocab.size)
    for (const [term, idx] of this.vocab) {
      const df = docFreq.get(term) ?? 0
      this.idf[idx] = Math.log((1 + n) / (1 + df)) + 1 // smooth_idf
    }

    this.docVectors = docTerms.map((terms) => this.buildVector(terms))

    console.log(
      `[RAG] ${this.articles.length} artigos indexados (${this.vocab.size} termos).`,
    )
  }

  private buildVector(terms: string[]): Vector {
    const counts = new Map<number, number>()
    for (const term of terms) {
      const idx = this.vocab.get(term)
      if (idx === undefined) continue
      counts.set(idx, (counts.get(idx) ?? 0) + 1)
    }

    const vec: Vector = new Map()
    let norm = 0
    for (const [idx, count] of counts) {
      const tf = 1 + Math.log(count) // sublinear_tf
      const weight = tf * (this.idf[idx] ?? 0)
      vec.set(idx, weight)
      norm += weight * weight
    }

    norm = Math.sqrt(norm) // normalização L2
    if (norm > 0) {
      for (const [idx, weight] of vec) vec.set(idx, weight / norm)
    }
    return vec
  }

  retrieve(query: string, topK = 3): RagArticle[] {
    const trimmed = query.trim()
    if (!trimmed) return []

    const queryVec = this.buildVector(tokenize(trimmed))
    if (queryVec.size === 0) return []

    const scored = this.docVectors
      .map((docVec, i) => ({ i, score: dot(queryVec, docVec) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)

    const results: RagArticle[] = []
    for (const { i, score } of scored) {
      if (score < 0.01) continue
      const article = this.articles[i]
      if (!article) continue
      results.push({
        titulo: article.titulo,
        texto: (article.texto ?? '').slice(0, 2000),
        url: article.url ?? '',
        categoria: article.categoria ?? '',
        tema: article.tema ?? [],
        tipo_conteudo: article.tipo_conteudo ?? '',
        score,
      })
    }
    return results
  }
}
