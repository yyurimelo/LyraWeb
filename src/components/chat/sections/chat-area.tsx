import { useState, useEffect, useRef } from 'react'
import type { UserGetAllFriendsDataModel } from '../../../@types/user/user-get-all-friends'
import { LyraIcon } from '@/components/logos/lyra-icon'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitialName } from '@/lib/get-initial-name'
import { ChatUserDetails } from './chat-user-details'

interface ChatAreaProps {
  selectedUser: UserGetAllFriendsDataModel | null
  onBackToList?: () => void
  isMobile?: boolean
}

interface MockMessage {
  id: string
  content: string
  sentAt: Date
  isFromMe: boolean
}

// Mock de mensagens para demonstração
const mockMessages: Record<string, MockMessage[]> = {
  '1': [
    {
      id: '1',
      content: 'Oi! Como você está?',
      sentAt: new Date(Date.now() - 3600000),
      isFromMe: false
    },
    {
      id: '2',
      content: 'Estou ótimo! E você?',
      sentAt: new Date(Date.now() - 3000000),
      isFromMe: true
    },
    {
      id: '3',
      content: 'Ótimo também! Quer conversar sobre o projeto?',
      sentAt: new Date(Date.now() - 1800000),
      isFromMe: false
    }
  ],
  '2': [
    {
      id: '1',
      content: 'Bom dia! Já viu o novo update?',
      sentAt: new Date(Date.now() - 7200000),
      isFromMe: true
    },
    {
      id: '2',
      content: 'Sim! Está muito bom, né?',
      sentAt: new Date(Date.now() - 6000000),
      isFromMe: false
    }
  ]
}

export function ChatArea({ selectedUser, onBackToList, isMobile }: ChatAreaProps) {
	const [open, setOpen] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState<MockMessage[]>(
    selectedUser ? mockMessages[selectedUser.id] || [] : []
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  // Atualizar mensagens quando o usuário selecionado mudar
  if (selectedUser && messages.length === 0) {
    const userMessages = mockMessages[selectedUser.id] || []
    if (userMessages.length > 0) {
      setMessages(userMessages)
    }
  }

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedUser) return

    const newMessage: MockMessage = {
      id: Date.now().toString(),
      content: messageInput,
      sentAt: new Date(),
      isFromMe: true
    }

    setMessages([...messages, newMessage])
    setMessageInput('')

    setTimeout(() => {
      const responseMessage: MockMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Recebido! 😊',
        sentAt: new Date(),
        isFromMe: false
      }
      setMessages(prev => [...prev, responseMessage])
    }, 1000)
  }

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (selectedUser) {
      scrollToBottom()
    }
  }, [selectedUser])

  // Monitorar scroll para mostrar/esconder botão
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const threshold = 200 // pixels do final para considerar "no final"
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + threshold

      setShowScrollButton(!isAtBottom)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // verificação inicial

    return () => container.removeEventListener('scroll', handleScroll)
  }, [messages])

	function openUserDetails() {
		setOpen(true)
	}

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <LyraIcon height="size-20 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            Bem-vindo ao Lyra
          </h2>
          <p className="text-muted-foreground">
            Selecione uma conversa da lista para começar a conversar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full max-h-full no-scrollbar">
      {/* Header do chat */}
      <div className="p-4 border-b bg-background cursor-pointer" onClick={() => openUserDetails()}>
        <div className="flex items-center">
          {isMobile && onBackToList && (
            <Button
              onClick={(e) => { onBackToList(); e.stopPropagation(); }}
              size={"icon"}
              className="bg-transparent hover:bg-transparent shadow-none"
            >
              <ChevronLeft className='text-foreground' />
            </Button>
          )}
          <Avatar className="size-11 rounded-full transition-transform mr-3">
            <AvatarImage
              src={selectedUser.AvatarUser}
              alt={selectedUser.name}
              className="object-cover"
            />
            <AvatarFallback
              style={{ backgroundColor: selectedUser.appearancePrimaryColor || 'hsl(var(--primary))' }}
              className="text-secondary-foreground font-semibold text-sm"
            >
              {getInitialName(selectedUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{selectedUser.name}</h3>
          </div>
        </div>
      </div>

      {/* Área de mensagens */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-background no-scrollbar relative"
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-xs lg:max-w-md px-4 py-2 rounded-2xl
                  ${message.isFromMe
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground border'
                  }
                `}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`
                  text-xs mt-1 justify-end flex
                  ${message.isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}
                `}>
                  {formatMessageTime(message.sentAt)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Botão flutuante para rolar para baixo */}
      </div>

        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            size="icon"
            variant="secondary"
            className="absolute cursor-pointer bottom-25 right-4 size-10 rounded-full shadow-lg backdrop-blur-sm border hover:bg-background/70 transition-all duration-200 hover:scale-105 z-10"
            aria-label="Rolar para o final"
          >
            <ChevronDown className="size-5 text-primary" />
          </Button>
        )}

      {/* Área de input de mensagem */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Digite uma mensagem..."
            className="flex-1 px-4 py-2 border border-input rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
          >
            Enviar
          </button>
        </div>
      </div>
			<ChatUserDetails open={open} setOpen={setOpen} user={selectedUser} />
    </div>
  )
}