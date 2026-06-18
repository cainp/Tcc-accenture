import { useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { ChatWindow } from './components/chat/ChatWindow'
import { useChatStore } from './store/chat.store'

export default function App() {
  const { conversations, createConversation } = useChatStore()

  // Seed an initial conversation so the UI is never empty
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen bg-[#131313] text-white overflow-hidden">
      <Sidebar />
      <ChatWindow />
    </div>
  )
}
