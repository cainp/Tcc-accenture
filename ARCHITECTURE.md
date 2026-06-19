# Arquitetura do Sistema

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                        RAILWAY (produção)                       │
│                                                                 │
│  ┌──────────────────┐   ┌──────────────┐   ┌───────────────┐  │
│  │  Backend (Bun)   │   │    Redis     │   │  RAG Service  │  │
│  │  porta 3000      │◄──►  porta 6379  │   │  porta 8000   │  │
│  │                  │   └──────────────┘   │  (Python)     │  │
│  │  serve frontend  │                      └───────┬───────┘  │
│  │  estático também │◄─────────────────────────────┘          │
│  └────────┬─────────┘                                          │
│           │                                                     │
└───────────┼─────────────────────────────────────────────────────┘
            │ HTTPS
            │
     ┌──────┴──────┐
     │   Browser   │
     │  (usuário)  │
     └─────────────┘
```

---

## Frontend (React + Vite)

Servido estaticamente pelo backend em produção (`/frontend/dist`).
Em desenvolvimento roda na porta 5173 com proxy para o backend.

```
App.tsx
├── useSession()          ← carrega/salva conversas no backend ao iniciar
├── Sidebar               ← lista de conversas, botão nova conversa
└── ChatWindow
    ├── Header            ← título da conversa ativa
    ├── MessageList
    │   └── MessageItem   ← renderiza markdown, animação de digitação, label de perfil
    └── MessageInput      ← textarea + seletor de perfil (professor/família/gestor)

Estado global: Zustand (chat.store)
 └── conversations[]      ← todas as conversas com mensagens e perfil por mensagem

Serviços
 ├── api.service          ← POST /api/chat (streaming SSE)
 └── session.service      ← GET/PUT /api/sessions/:id
```

**Fluxo de envio de mensagem:**
```
usuário digita + seleciona perfil
        ↓
  useChat.sendMessage()
        ↓
  api.service.streamChatCompletion()   ← POST /api/chat { messages, profile }
        ↓
  chunks chegam via SSE
        ↓
  appendToLastMessage()   ← atualiza store chunk a chunk
        ↓
  MessageItem renderiza com animação de digitação
        ↓  (ao final)
  useSession salva conversa no backend
```

---

## Backend (Bun + Hono)

```
index.ts  (porta 3000)
├── POST /api/chat          → chat.routes → ChatController → AIService
├── GET  /api/sessions/:id  → session.routes → SessionController → SessionService
├── PUT  /api/sessions/:id  → session.routes → SessionController → SessionService
├── GET  /health
└── GET  *                  → serve frontend/dist (SPA fallback)
```

### AIService — fluxo de resposta

```
POST /api/chat { messages, profile }
        ↓
  resolveProfile(profile)
  → temperatura, max_tokens e persona por perfil
        ↓
  llmCaches.get(profile)
  → SemanticCacheService<string> (namespace: llm-{profile})
        ↓ cache hit?
        ├── SIM → yield resposta cacheada → anima no frontend
        └── NÃO ↓
              retrieveContext(query)
                ├── ragCache.get()    ← SemanticCacheService<RagArticle[]>
                └── RAG Service /retrieve  ← top 5 artigos por similaridade
              ↓
              buildSystemPrompt(persona, artigos)
              → [SYSTEM_PROMPT.md] + [artigos] + [INSTRUÇÃO FINAL de perfil]
              ↓
              Groq API (llama-3.1-8b-instant) — streaming SSE
              ↓
              yield chunks → acumula fullResponse
              ↓
              llmCache.set(query, fullResponse)  ← fire-and-forget
```

### SessionService — persistência de conversas

```
Redis disponível?
├── SIM → session:{sessionId}  (TTL 30 dias)
└── NÃO → fallback local: data/sessions.json
```

### SemanticCacheService — cache semântico genérico

```
Instâncias criadas em chat.routes.ts:
 ├── ragCache          namespace: "rag"           → cacheia RagArticle[]
 ├── llmCaches["professor"]  namespace: "llm-professor"  → cacheia string
 ├── llmCaches["familia"]    namespace: "llm-familia"
 ├── llmCaches["gestor"]     namespace: "llm-gestor"
 └── llmCaches["default"]    namespace: "llm-default"

Cada instância usa namespace separado no Redis para evitar
que perguntas similares de perfis diferentes retornem a mesma resposta.

Chaves no Redis:
 sem_cache:{namespace}:index   → Set com todas as chaves ativas
 sem_cache:{namespace}:{uuid}  → JSON { query, embedding, value }  (TTL 7 dias)

Fluxo get(query):
 1. smembers(index)          → lista todas as chaves
 2. embed(query) + mget(keys) em paralelo  ← Cohere API
 3. cosineSimilarity(queryEmb, entryEmb) para cada entrada
 4. score ≥ 0.82 → HIT, retorna value
    score < 0.82 → MISS, retorna null
```

---

## Serviços Externos

| Serviço | Uso | Modelo / Endpoint |
|---------|-----|-------------------|
| **Groq** | Geração de respostas (LLM) | `llama-3.1-8b-instant` |
| **Cohere** | Embeddings para cache semântico | `embed-multilingual-v3.0` |
| **RAG Service** | Recuperação de artigos do Portal Diversa | `POST /retrieve` |
| **Redis** | Sessões de usuário + cache semântico | — |

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `GROQ_API_KEY` | ✅ | Chave da API Groq |
| `COHERE_API_KEY` | ⚠️ | Chave Cohere — cache semântico desativado se ausente |
| `REDIS_URL` | ⚠️ | URL Redis — sessões caem para arquivo local se ausente |
| `RAG_SERVICE_URL` | ✅ | URL do serviço RAG (padrão: `http://localhost:8000`) |
| `FRONTEND_URL` | ✅ | URL do frontend para CORS (padrão: `http://localhost:5173`) |
| `PORT` | — | Porta do backend (padrão: `3000`) |
| `SYSTEM_PROMPT` | — | Prompt base; lido de `SYSTEM_PROMPT.md` se existir |
