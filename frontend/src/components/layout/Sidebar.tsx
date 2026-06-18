import { useEffect, useRef, useState } from 'react'
import { useChat } from '../../hooks/useChat'
import type { Conversation } from '../../types/chat'

export function Sidebar() {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
    renameConversation,
    deleteConversation,
  } = useChat()

  return (
    <aside className="w-64 flex flex-col bg-[#201F1F] h-full flex-shrink-0">
      <div className="p-4">
        <button
          onClick={createConversation}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-white/10 text-sm text-white hover:bg-white/5 transition-colors"
        >
          <span className="text-[#A100FF] text-base leading-none">+</span>
          New Chat
        </button>
      </div>

      <div className="px-4 pb-1">
        <p className="text-[11px] font-semibold text-gray-500 tracking-widest uppercase">
          Recent
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-px">
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conv={conv}
            isActive={activeConversationId === conv.id}
            onSelect={() => setActiveConversation(conv.id)}
            onRename={(title) => renameConversation(conv.id, title)}
            onDelete={() => deleteConversation(conv.id)}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
          <HelpIcon />
          Help
        </button>
      </div>
    </aside>
  )
}

interface ItemProps {
  conv: Conversation
  isActive: boolean
  onSelect: () => void
  onRename: (title: string) => void
  onDelete: () => void
}

function ConversationItem({ conv, isActive, onSelect, onRename, onDelete }: ItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(conv.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation()
    setDraft(conv.title)
    setEditing(true)
  }

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== conv.title) onRename(trimmed)
    setEditing(false)
  }

  function cancel() {
    setDraft(conv.title)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="px-3 py-2 rounded-lg bg-white/10">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') cancel()
          }}
          className="w-full bg-transparent border-b border-[#A100FF] text-white text-sm outline-none pb-0.5"
        />
      </div>
    )
  }

  return (
    <div
      className={`group relative flex items-center rounded-lg text-sm transition-colors ${
        isActive
          ? 'bg-white/10 text-white'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <button
        onClick={onSelect}
        className="flex-1 text-left px-3 py-2 truncate min-w-0"
      >
        {conv.title}
      </button>

      <div className="hidden group-hover:flex items-center gap-0.5 pr-1.5 flex-shrink-0">
        <button
          onClick={startEdit}
          title="Renomear"
          className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
        >
          <PencilIcon />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          title="Excluir"
          className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
