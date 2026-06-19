import { Header } from '../layout/Header'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { useChat } from '../../hooks/useChat'
import { AccureArrow } from '../ui/Logo'

export function ChatWindow() {
  const { activeConversation, activeConversationId, isStreaming, sendMessage, stopStreaming } =
    useChat()

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <Header title={activeConversation?.title ?? 'Nova Conversa'} />

      <div className="flex-1 overflow-hidden">
        {activeConversation && activeConversation.messages.length > 0 ? (
          <MessageList messages={activeConversation.messages} isStreaming={isStreaming} />
        ) : (
          <WelcomeScreen />
        )}
      </div>

      <MessageInput
        onSend={sendMessage}
        onStop={stopStreaming}
        isStreaming={isStreaming}
        disabled={!activeConversationId}
      />
    </main>
  )
}

function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-14 h-14 rounded-full bg-[#A100FF]/15 border border-[#A100FF]/20 flex items-center justify-center mb-5">
        <AccureArrow size={22} />
      </div>
      <h2 className="text-2xl font-semibold text-white mb-2">
        Como posso te ajudar hoje?
      </h2>
      <p className="text-gray-400 text-sm max-w-xs">
        Estou pronto para te auxiliar na criação de aulas acessíveis, busca por recursos pedagógicos ou dúvidas sobre inclusão escolar
      </p>
    </div>
  )
}
