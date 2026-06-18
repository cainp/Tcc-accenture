import { useChat } from '../../hooks/useChat'

export function Sidebar() {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
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
          <button
            key={conv.id}
            onClick={() => setActiveConversation(conv.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${
              activeConversationId === conv.id
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {conv.title}
          </button>
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

function HelpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
