import { Sidebar } from './components/layout/Sidebar'
import { ChatWindow } from './components/chat/ChatWindow'
import { useSession } from './hooks/useSession'

export default function App() {
  useSession()

  return (
    <div className="flex h-screen bg-[#131313] text-white overflow-hidden">
      <Sidebar />
      <ChatWindow />
    </div>
  )
}
