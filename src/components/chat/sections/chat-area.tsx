import { useState, useEffect, useRef } from 'react'
import type { UserGetAllFriendsDataModel } from '../../../@types/user/user-get-all-friends'
import { LyraIcon } from '@/components/logos/lyra-icon'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitialName } from '@/lib/get-initial-name'
import { ChatUserDetails } from './chat-user-details'
import { useGetMessagesQuery, useSendMessageMutation } from '@/http/hooks/message.hooks'
import { useAuth } from '@/contexts/auth-provider'
import { useSignalR } from '@/http/hooks/use-signalr-messages'

interface ChatAreaProps {
  selectedUser: UserGetAllFriendsDataModel | null
  onBackToList?: () => void
  isMobile?: boolean
}

export function ChatArea({ selectedUser, onBackToList, isMobile }: ChatAreaProps) {
  const [open, setOpen] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const { user } = useAuth()

  const { sendMessage } = useSignalR({
    userId: user?.id || '',
    onMessage: () => {
    }
  })

  const { data: messages = [], isPending } = useGetMessagesQuery(
    selectedUser?.id || null
  )

  const allMessages = messages

  const sendMessageMutation = useSendMessageMutation()

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUser || !user?.id || isSending) return

    const messageContent = messageInput.trim()
    setMessageInput('')
    setIsSending(true)

    try {
      await sendMessage(String(selectedUser.id), messageContent)
    } catch (error) {
      console.error('Error sending message:', error)
      await sendMessageMutation.mutateAsync({
        receiverId: String(selectedUser.id),
        content: messageContent
      })
    } finally {
      setIsSending(false)
    }
  }

  const formatMessageTime = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const scrollToBottom = (smooth: boolean = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }

  const scrollToBottomInstant = () => {
    scrollToBottom(false)
  }

  useEffect(() => {
    if (selectedUser) scrollToBottomInstant()
  }, [selectedUser])

  // Scroll para baixo quando novas mensagens chegam
  useEffect(() => {
    if (!allMessages.length || !selectedUser) return

    // Se for a primeira mensagem, sempre vai para o final
    if (allMessages.length === 1) {
      scrollToBottomInstant()
      return
    }

    const lastMessage = allMessages[allMessages.length - 1]
    const isMyMessage = lastMessage.senderId === user?.id

    // Se for minha mensagem, sempre faz scroll
    if (isMyMessage) {
      scrollToBottom(false)
      return
    }

    // Se for mensagem de outra pessoa, só faz scroll se já estiver perto do final
    const container = messagesContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const threshold = 100
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + threshold

    if (isAtBottom) {
      scrollToBottom(false)
    }
  }, [allMessages, selectedUser, user?.id])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const threshold = 100
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + threshold
      setShowScrollButton(!isAtBottom)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

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
          <h2 className="text-xl font-semibold mb-2">Bem-vindo ao Lyra</h2>
          <p className="text-muted-foreground">
            Selecione uma conversa da lista para começar a conversar
          </p>
        </div>
      </div>
    )
  }

  // Não mostra nada enquanto carrega - a tela só aparece quando os dados da API chegarem
  if (isPending) return null

  return (
    <div className="flex-1 flex flex-col h-full max-h-full no-scrollbar">
      {/* Header */}
      <div
        className="p-4 border-b bg-background cursor-pointer"
        onClick={() => openUserDetails()}
      >
        <div className="flex items-center">
          {isMobile && onBackToList && (
            <Button
              onClick={(e) => {
                onBackToList()
                e.stopPropagation()
              }}
              size="icon"
              className="bg-transparent hover:bg-transparent shadow-none"
            >
              <ChevronLeft className="text-foreground" />
            </Button>
          )}

          <Avatar className="size-11 rounded-full mr-3">
            <AvatarImage
              src={selectedUser.avatarUser}
              alt={selectedUser.name}
              className="object-cover"
            />
            <AvatarFallback
              style={{
                backgroundColor:
                  selectedUser.appearancePrimaryColor || 'hsl(var(--primary))'
              }}
              className="text-secondary-foreground font-semibold text-sm"
            >
              {getInitialName(selectedUser.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex items-center gap-2">
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
          {allMessages.map((message) => {
            const isFromMe = message.senderId === user?.id

            return (
              <div
                key={message.id}
                className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isFromMe
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground border'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 justify-end flex ${
                      isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}
                  >
                    {formatMessageTime(message.sentAt)}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {showScrollButton && (
          <Button
            onClick={() => scrollToBottom(true)} // Scroll suave ao clicar no botão
            size="icon"
            variant="secondary"
            className="absolute bottom-20 right-4 size-11 rounded-full shadow-lg backdrop-blur-sm bg-background/90 border hover:bg-background hover:scale-110 transition-all duration-200 z-20"
          >
            <ChevronDown className="size-5 text-primary" />
          </Button>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Digite uma mensagem..."
            className="flex-1 px-4 py-2 border border-input rounded-full bg-background focus:ring-2 focus:ring-primary"
          />

          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSending}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:bg-muted transition-colors flex items-center gap-2"
          >
            {isSending && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            Enviar
          </button>
        </div>
      </div>

      <ChatUserDetails open={open} setOpen={setOpen} user={selectedUser} />
    </div>
  )
}
