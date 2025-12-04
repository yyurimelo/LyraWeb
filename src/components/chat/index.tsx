import { useState } from 'react'
import { useGetAllFriendsQuery } from '../../http/hooks/user.hooks'
import { UserList } from './sections/user-list'
import { ChatArea } from './sections/chat-area'
import type { UserGetAllFriendsDataModel } from '../../@types/user/user-get-all-friends'

export function ChatComponent() {
  const [selectedUser, setSelectedUser] = useState<UserGetAllFriendsDataModel | null>(null)
  const { data: friends, isLoading, error } = useGetAllFriendsQuery()

  return (
    <div className="flex flex-1 h-full min-h-0">
      {/* Lista de usuários - Lado esquerdo */}
      <div className="w-100 border-r flex flex-col min-h-0">
        <div className="p-4 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold">Conversas</h2>
        </div>
        <div className="flex-1 min-h-0">
          <UserList
            users={friends as any || []}
            selectedUser={selectedUser}
            onUserSelect={setSelectedUser}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>

      {/* Área do chat - Lado direito */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatArea selectedUser={selectedUser} />
      </div>
    </div>
  )
}