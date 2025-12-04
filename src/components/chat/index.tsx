import { useState, useEffect } from 'react'
import { useGetAllFriendsQuery } from '../../http/hooks/user.hooks'
import { UserList } from './sections/user-list'
import { ChatArea } from './sections/chat-area'
import type { UserGetAllFriendsDataModel } from '../../@types/user/user-get-all-friends'

export function ChatComponent() {
  const [selectedUser, setSelectedUser] = useState<UserGetAllFriendsDataModel | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [currentView, setCurrentView] = useState<'list' | 'chat'>('list')
  const { data: friends, isLoading, error } = useGetAllFriendsQuery()

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // Se for desktop, sempre mostrar as duas colunas
      if (window.innerWidth >= 768) {
        setCurrentView('list')
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Em mobile, quando um usuário é selecionado, mostrar a view de chat
  const handleUserSelect = (user: UserGetAllFriendsDataModel) => {
    setSelectedUser(user)
    if (isMobile) {
      setCurrentView('chat')
    }
  }

  // Função para voltar para a lista em mobile
  const handleBackToList = () => {
    setCurrentView('list')
  }

  return (
    <div className="flex flex-1 h-full min-h-0 relative">
      {/* Lista de usuários - Desktop: sempre visível, Mobile: visível apenas quando currentView === 'list' */}
      <div className={`
        ${isMobile ? 'absolute inset-0 z-10' : 'w-80 border-r'}
        flex flex-col min-h-0 bg-background
        ${isMobile && currentView !== 'list' ? 'hidden' : 'flex'}
      `}>
        <div className="p-4 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold">Conversas</h2>
        </div>
        <div className="flex-1 min-h-0">
          <UserList
            users={friends as any || []}
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