import { useState, useCallback } from 'react'
import { Header } from '../layout/Header'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { useChat } from '../../hooks/useChat'
import { AccureArrow } from '../ui/Logo'

type UserProfile = 'professor' | 'familia' | 'gestor'

export function ChatWindow() {
  const { activeConversation, activeConversationId, isStreaming, sendMessage, stopStreaming } =
    useChat()

  const [profile, setProfile] = useState<UserProfile | undefined>(undefined)

  const hasMessages = activeConversation && activeConversation.messages.length > 0

  const handleSend = useCallback(
    (text: string) => sendMessage(text, profile),
    [sendMessage, profile],
  )

  const inputProps = {
    onSend: handleSend,
    onStop: stopStreaming,
    isStreaming,
    disabled: !activeConversationId,
    profile,
    onProfileChange: setProfile,
  }

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <Header title={activeConversation?.title ?? 'Nova Conversa'} />

      {hasMessages ? (
        <>
          <div className="flex-1 overflow-hidden">
            <MessageList messages={activeConversation.messages} isStreaming={isStreaming} />
          </div>
          <div className="input-slide-down">
            <MessageInput {...inputProps} />
          </div>
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
  profile?: UserProfile
  onProfileChange: (profile: UserProfile | undefined) => void
}

function WelcomeScreen({ onSend, onStop, isStreaming, disabled, profile, onProfileChange }: WelcomeScreenProps) {
  return (
    <div className="w-full flex flex-col items-center text-center px-6">
      <div className="flex items-center gap-3 mb-2">
        <AccureArrow size={22} />
        <h2 className="text-[32px] font-semibold text-white">
          Como posso te ajudar hoje?
        </h2>
      </div>
      <p className="text-gray-400 text-base font-light max-w-lg mb-8">
        Estou pronto para te auxiliar na criação de aulas acessíveis, busca por recursos pedagógicos ou dúvidas sobre inclusão escolar
      </p>
      <div className="w-full max-w-3xl">
        <MessageInput
          onSend={onSend}
          onStop={onStop}
          isStreaming={isStreaming}
          disabled={disabled}
          profile={profile}
          onProfileChange={onProfileChange}
        />
      </div>
    </div>
  )
}
