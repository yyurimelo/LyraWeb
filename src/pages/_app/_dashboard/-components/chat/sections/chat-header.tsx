import { useState } from 'react'
import type { UserGetAllFriendsDataModel } from '@/@types/user/user-get-all-friends'
import { Button } from '@/shared/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { getInitialName } from '@/lib/get-initial-name'
import { ChatUserDetails } from './chat-user-details'

interface ChatHeaderProps {
  selectedUser: UserGetAllFriendsDataModel
  onBackToList?: () => void
  isMobile?: boolean
  onUserRemoved?: () => void
}

export function ChatHeader({ selectedUser, onBackToList, isMobile, onUserRemoved }: ChatHeaderProps) {
  const [open, setOpen] = useState(false)

  function openUserDetails() {
    setOpen(true)
  }

  return (
    <>
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

      <ChatUserDetails open={open} setOpen={setOpen} user={selectedUser} onUserRemoved={onUserRemoved} />
    </>
  )
}