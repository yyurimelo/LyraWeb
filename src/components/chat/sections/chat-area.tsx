import { useEffect, useRef, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { UserGetAllFriendsDataModel } from '../../../@types/user/user-get-all-friends'
import { LyraIcon } from '@/components/logos/lyra-icon'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { ChatHeader } from './chat-header'
import { ChatInput } from './chat-input'
import { useGetMessagesQuery, useSendMessageMutation } from '@/http/hooks/message.hooks'
import { useAuth } from '@/contexts/auth-provider'
import { useSignalRMessages } from '@/http/hooks/use-signalr-messages'

interface ChatAreaProps {
  selectedUser: UserGetAllFriendsDataModel | null
  onBackToList?: () => void
  isMobile?: boolean
}

export function ChatArea({ selectedUser, onBackToList, isMobile }: ChatAreaProps) {
  const { t, i18n } = useTranslation()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const { user } = useAuth()

  const hasInitialScrollRef = useRef(false)

  const lastScrollTopRef = useRef(0)

  const { data: messages, isFetched } = useGetMessagesQuery(
    selectedUser?.id ?? null
  )

  const { sendMessage } = useSignalRMessages({
    userId: user?.id || '',
    enabled: isFetched, // 👈 só depois da API
  })


  const allMessages = messages

  const sendMessageMutation = useSendMessageMutation()

  const handleMessageSend = async (message: string) => {
    if (!selectedUser || !user?.id) return

    try {
      await sendMessage(String(selectedUser.id), message)
    } catch (error) {
      console.error('Error sending message:', error)
      await sendMessageMutation.mutateAsync({
        receiverId: String(selectedUser.id),
        content: message
      })
    }
  }

  const formatMessageTime = (date: string | Date) => {
    // Converte para UTC tratando strings corretamente
    const dateStr = typeof date === 'string' ? date : date.toISOString()
    // Verifica se já tem timezone, senão adiciona Z para tratar como UTC
    const finalDateStr = dateStr.includes('Z') || dateStr.includes('+') || (dateStr.includes('-', 10) && dateStr.length > 10)
      ? dateStr
      : dateStr + 'Z'
    const dateObj = new Date(finalDateStr)
    return dateObj.toLocaleTimeString(i18n.language, {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const scrollToBottom = (smooth: boolean = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
        inline: 'nearest'
      })
    }
  }

  const scrollToBottomInstant = () => {
    scrollToBottom(false)
  }

  useEffect(() => {
    if (!selectedUser || allMessages?.length === 0) return

    const container = messagesContainerRef.current
    if (!container) return

    if (!allMessages || allMessages.length === 0) return

    const lastMessage = allMessages[allMessages.length - 1]
    const isMyMessage = lastMessage.senderId === user?.id

    // Sempre rola se for minha mensagem
    if (isMyMessage) {
      scrollToBottom(false)
      return
    }

    // Se for mensagem recebida, só rola se estiver perto do final
    const { scrollTop, scrollHeight, clientHeight } = container
    const threshold = 100
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + threshold

    if (isAtBottom) {
      scrollToBottom(false)
    }
  }, [allMessages?.length, selectedUser?.id, user?.id])

  useLayoutEffect(() => {
    if (!selectedUser) return
    if (!allMessages || allMessages.length === 0) return

    if (!hasInitialScrollRef.current) {
      scrollToBottomInstant()
      hasInitialScrollRef.current = true
    }
  }, [selectedUser?.id, allMessages?.length])

  useEffect(() => {
    hasInitialScrollRef.current = false
  }, [selectedUser?.id])


  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container

      // Se não tiver scroll, nunca mostra o botão
      if (scrollHeight <= clientHeight) {
        setShowScrollButton(false)
        lastScrollTopRef.current = scrollTop
        return
      }

      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      const thresholdFromBottom = 80

      const isScrollingUp = scrollTop < lastScrollTopRef.current

      // Só mostra se:
      // 1. Usuário estiver SUBINDO
      // 2. Estiver afastado do final
      if (isScrollingUp && distanceFromBottom > thresholdFromBottom) {
        setShowScrollButton(true)
      }

      // Esconde automaticamente quando chega no final
      if (distanceFromBottom <= thresholdFromBottom) {
        setShowScrollButton(false)
      }

      lastScrollTopRef.current = scrollTop
    }


    // Adiciona um delay inicial para garantir que o container tenha conteúdo
    const initialTimer = setTimeout(() => {
      handleScroll()
      container.addEventListener('scroll', handleScroll, { passive: true })
    }, 100)

    // Também recalcula quando as mensagens mudam
    const messagesTimer = setTimeout(() => {
      handleScroll()
    }, 300)

    return () => {
      clearTimeout(initialTimer)
      clearTimeout(messagesTimer)
      container.removeEventListener('scroll', handleScroll)
    }
  }, [allMessages?.length, selectedUser]) // Adiciona selectedUser para recalcular ao mudar de conversa

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <LyraIcon height="size-20 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t('chat.welcome')}</h2>
          <p className="text-muted-foreground">
            {t('chat.selectConversation')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full max-h-full no-scrollbar">
      <ChatHeader
        selectedUser={selectedUser}
        onBackToList={onBackToList}
        isMobile={isMobile}
      />

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-background no-scrollbar relative"
      >
        <div className="space-y-4">
          {messages?.map((message) => {
            const isFromMe = message.senderId === user?.id

            return (
              <div
                key={message.id}
                className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${isFromMe
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground border'
                    }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 justify-end flex ${isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
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
      </div>

      {showScrollButton && (
        <Button
          onClick={() => scrollToBottom(true)}
          size="icon"
          variant="secondary"
          className="absolute bottom-25 right-4 size-12 rounded-full shadow-lg backdrop-blur-sm bg-background/90 border border-border hover:bg-background hover:scale-110 transition-all duration-200 z-50"
          aria-label={t('chat.scrollDown')}
        >
          <ChevronDown className="size-6 text-primary" />
        </Button>
      )}

      <ChatInput
        ref={inputRef}
        onSendMessage={handleMessageSend}
        disabled={!selectedUser}
      />
    </div>
  )
}
