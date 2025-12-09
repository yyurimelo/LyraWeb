import { useState, useEffect, useRef, useCallback } from 'react'
import type { UserGetAllFriendsDataModel } from '../../../@types/user/user-get-all-friends'
import { LyraIcon } from '@/components/logos/lyra-icon'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitialName } from '@/lib/get-initial-name'
import { ChatUserDetails } from './chat-user-details'
import { useGetMessagesQuery, useSendMessageMutation } from '@/http/hooks/message.hooks'
import { useSignalRMessages } from '@/http/hooks/use-signalr-messages'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-provider'

interface ChatAreaProps {
  selectedUser: UserGetAllFriendsDataModel | null
  onBackToList?: () => void
  isMobile?: boolean
}

export function ChatArea({ selectedUser, onBackToList, isMobile }: ChatAreaProps) {
  const [open, setOpen] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const [showScrollButton, setShowScrollButton] = useState(false)
  const { user } = useAuth()

  // ---------------------------
  // ESTADO LOCAL PARA TODAS AS MENSAGENS (API + SignalR + otimistas)
  // ---------------------------
  const [localMessages, setLocalMessages] = useState<any[]>([])

  // ---------------------------
  // FETCH DAS MENSAGENS INICIAIS
  // ---------------------------
  const { data: messages = [], isLoading, error } = useGetMessagesQuery(
    selectedUser?.id || null
  )

  // ---------------------------
  // LIMPA E INVALIDA MENSAGENS AO TROCAR DE USUÁRIO
  // ---------------------------
  useEffect(() => {
    // Limpa as mensagens locais ao trocar de usuário
    setLocalMessages([])

    // Invalida o cache para forçar busca do servidor
    if (selectedUser?.id) {
      queryClient.invalidateQueries({
        queryKey: ['messages', selectedUser.id]
      })
    }
  }, [selectedUser?.id, queryClient])

  // ---------------------------
  // CARREGA MENSAGENS DO USUÁRIO SELECIONADO
  // ---------------------------
  useEffect(() => {
    if (!selectedUser) return

    // Pega as mensagens do cache do React Query (que podem incluir mensagens recebidas via SignalR)
    const cachedMessages = queryClient.getQueryData<any[]>(['messages', selectedUser.id]) || []

    // Se não tem mensagens da API ainda, usa só as do cache
    if (!messages) {
      setLocalMessages(cachedMessages.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()))
      return
    }

    // Combina mensagens da API com as do cache, removendo duplicatas
    const allMessageIds = new Set()
    const combinedMessages = [...messages, ...cachedMessages]
      .filter(msg => {
        if (allMessageIds.has(msg.id)) return false
        allMessageIds.add(msg.id)
        return true
      })
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())

    setLocalMessages(combinedMessages)
  }, [messages, selectedUser, queryClient])

  // ---------------------------
  // SIGNALR RECEBENDO MENSAGENS EM TEMPO REAL
  // ---------------------------
  const handleMessageReceived = useCallback((incomingMessage: any) => {
    // Só adiciona a mensagem se pertencer ao usuário selecionado
    if (!selectedUser || (incomingMessage.senderId !== selectedUser.id && incomingMessage.receiverId !== selectedUser.id)) {
      return
    }

    setLocalMessages(prev => {
      const exists = prev.some(m => m.id === incomingMessage.id)
      if (exists) return prev
      return [...prev, incomingMessage]
    })
  }, [selectedUser])

  useSignalRMessages({ onMessage: handleMessageReceived })

  const sendMessageMutation = useSendMessageMutation()

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedUser || !user?.id) return

    const messageContent = messageInput.trim()
    setMessageInput('')

    // ---------------------------
    // MENSAGEM OTIMISTA
    // ---------------------------
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId: selectedUser.id,
      content: messageContent,
      sentAt: new Date().toISOString(),
      isOptimistic: true
    }

    setLocalMessages(prev => [...prev, optimisticMessage])

    // ENVIA PRO BACKEND
    sendMessageMutation.mutate({
      receiverId: String(selectedUser.id),
      content: messageContent
    })
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

  // Scroll para baixo quando novas mensagens chegam (apenas se já estiver no final)
  useEffect(() => {
    if (!localMessages.length || !selectedUser) return

    const container = messagesContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const threshold = 100
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + threshold

    // Apenas faz scroll se já estiver perto do final
    if (isAtBottom) {
      scrollToBottom(false) // Scroll instantâneo para novas mensagens
    }
  }, [localMessages, selectedUser])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const threshold = 200
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + threshold
      setShowScrollButton(!isAtBottom)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => container.removeEventListener('scroll', handleScroll)
  }, []) // Removido localMessages do array de dependências

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
        {isLoading && (
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="text-center text-destructive">
            Erro ao carregar mensagens
          </div>
        )}

        <div className="space-y-4">
          {localMessages.map((message) => {
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
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:bg-muted transition-colors flex items-center gap-2"
          >
            {sendMessageMutation.isPending && (
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
