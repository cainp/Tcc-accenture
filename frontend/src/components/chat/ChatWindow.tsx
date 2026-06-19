import { Header } from '../layout/Header'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { useChat } from '../../hooks/useChat'
import { AccureArrow } from '../ui/Logo'

export function ChatWindow() {
  const { activeConversation, activeConversationId, isStreaming, sendMessage, stopStreaming } =
    useChat()

  const hasMessages = activeConversation && activeConversation.messages.length > 0

  const inputProps = {
    onSend: sendMessage,
    onStop: stopStreaming,
    isStreaming,
    disabled: !activeConversationId,
  }

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <Header />

      {hasMessages ? (
        <>
          <div className="flex-1 overflow-hidden">
            <MessageList messages={activeConversation.messages} isStreaming={isStreaming} />
          </div>
          <MessageInput {...inputProps} />
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
          <WelcomeScreen {...inputProps} />
        </div>
      )}
    </main>
  )
}

interface WelcomeScreenProps {
  onSend: (text: string) => void
  onStop: () => void
  isStreaming: boolean
  disabled: boolean
}

function WelcomeScreen({ onSend, onStop, isStreaming, disabled }: WelcomeScreenProps) {
  return (
    <div className="w-full flex flex-col items-center text-center px-6">
      <div className="w-14 h-14 rounded-full bg-[#A100FF]/15 border border-[#A100FF]/20 flex items-center justify-center mb-5">
        <AccureArrow size={22} />
      </div>
      <h2 className="text-2xl font-semibold text-white mb-2">
        Como posso te ajudar hoje?
      </h2>
      <p className="text-gray-400 text-sm max-w-xs mb-8">
        Estou pronto para te auxiliar na criação de aulas acessíveis, busca por recursos pedagógicos ou dúvidas sobre inclusão escolar
      </p>
      <div className="w-full max-w-3xl">
        <MessageInput onSend={onSend} onStop={onStop} isStreaming={isStreaming} disabled={disabled} />
      </div>
    </div>
  )
}
