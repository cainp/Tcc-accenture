import type { Conversation } from '../types/chat'

const SESSION_KEY = 'accure_session_id'

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export async function loadSession(sessionId: string): Promise<Conversation[]> {
  try {
    const res = await fetch(`/api/sessions/${sessionId}`)
    if (!res.ok) return []
    const data = (await res.json()) as { conversations: unknown[] }
    return deserialize(data.conversations ?? [])
  } catch {
    return []
  }
}

export async function saveSession(
  sessionId: string,
  conversations: Conversation[],
): Promise<void> {
  try {
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversations }),
    })
  } catch {
    // persistence is best-effort
  }
}

function deserialize(raw: unknown[]): Conversation[] {
  return (raw as Array<Record<string, unknown>>).map((c) => ({
    ...(c as Omit<Conversation, 'createdAt' | 'messages'>),
    createdAt: new Date(c.createdAt as string),
    messages: (c.messages as Array<Record<string, unknown>>).map((m) => ({
      ...(m as object),
      createdAt: new Date(m.createdAt as string),
    })),
  })) as Conversation[]
}
