import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetAllFriendsQuery } from '../../../../shared/http/hooks/user.hooks'

import { UserList } from './sections/user-list'
import { ChatArea } from './sections/chat-area'
import { Input } from '@/shared/components/ui/input'
import type { UserGetAllFriendsDataModel } from '@/@types/user/user-get-all-friends'

interface ChatProps {
  className?: string;
}

export function Chat({ className }: ChatProps) {
  const { t } = useTranslation()
  const [selectedUser, setSelectedUser] = useState<UserGetAllFriendsDataModel | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [currentView, setCurrentView] = useState<'list' | 'chat'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const { data: friends, isLoading, error } = useGetAllFriendsQuery()

  // A lista de amigos será atualizada automaticamente pelo SignalR no ChatArea

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setCurrentView('list')
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleUserSelect = (user: UserGetAllFriendsDataModel) => {
    setSelectedUser(user)
    if (isMobile) {
      setCurrentView('chat')
    }
  }

  const handleBackToList = () => {
    setCurrentView('list')
  }

  function normalize(text: string = "") {
    return text
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "") // remove acentos
      .toLowerCase()
  }

  const list = Array.isArray(friends) ? friends : []

  const filteredUsers = list.filter(user => {
    const query = normalize(searchQuery)

    return (
      normalize(user.name).includes(query) ||
      normalize(user.description ?? "").includes(query) ||
      normalize(user.lastMessage ?? "").includes(query)
    )
  })


  return (
    <div className={`flex flex-1 h-full min-h-0 relative ${className}`}>
      {/* Lista de usuários - Desktop: sempre visível, Mobile: visível apenas quando currentView === 'list' */}
      <div className={`
        ${isMobile ? 'absolute inset-0 z-10' : 'w-140 border-r'}
        flex flex-col min-h-0 bg-background
        ${isMobile && currentView !== 'list' ? 'hidden' : 'flex'}
      `}>
        <div className="p-4 flex-shrink-0 mb-3">
          <div className="mb-3">
            <h2 className="text-xl font-semibold">{t('chat.title')}</h2>
          </div>
          <div className="relative">
            <Input
              placeholder={t('chat.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10" // espaço pro icon
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                ×
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <UserList
            users={filteredUsers}
            selectedUser={selectedUser}
            onUserSelect={handleUserSelect}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>

      {/* Área do chat - Desktop: sempre visível, Mobile: visível apenas quando currentView === 'chat' */}
      <div className={`
        ${isMobile ? 'absolute inset-0' : 'flex-1'}
        flex flex-col min-h-0 bg-background
        ${isMobile && currentView !== 'chat' ? 'hidden' : 'flex'}
      `}>
        <ChatArea
          selectedUser={selectedUser}
          onBackToList={isMobile ? handleBackToList : undefined}
          isMobile={isMobile}
        />
      </div>
    </div>
  )
}