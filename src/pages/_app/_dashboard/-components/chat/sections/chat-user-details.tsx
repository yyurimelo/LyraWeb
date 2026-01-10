import * as React from "react"
import type { UserGetAllFriendsDataModel } from "@/@types/user/user-get-all-friends"
import { useTranslation } from "react-i18next"
import {
  Sheet,
  SheetContent, SheetHeader,
  SheetTitle
} from "@/shared/components/ui/sheet"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar"
import { getInitialName } from "@/lib/get-initial-name"
import type { Dispatch } from "react"
import { useRemoveFriendMutation } from "@/shared/http/hooks/user.hooks"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { UserRoundX } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"


interface ChatUserDetailsProps {
  user: UserGetAllFriendsDataModel
  open: boolean;
  setOpen: Dispatch<React.SetStateAction<boolean>>;
}

export function ChatUserDetails({ user, open, setOpen }: ChatUserDetailsProps) {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const { mutateAsync: removeFriendFn, isPending } =
    useRemoveFriendMutation();

  async function handleRemoveFriend() {
    if (!user.userIdentifier) return;

    try {
      await removeFriendFn(user.userIdentifier);
      await navigate({
        to: "/"
      })
      setOpen(false)
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error(t('userSearch.chatUserDetails.removeError'));
    }
  }


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle>{t('userDetails.title')}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-4">
          {/* User Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={user.avatarUser}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback
                style={{ backgroundColor: user.appearancePrimaryColor || 'hsl(var(--primary))' }}
                className="text-secondary-foreground font-semibold text-2xl"
              >
                {getInitialName(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="text-center">
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground mt-2 px-4">
                {user.email}
              </p>
            </div>
          </div>

          <div>
            <strong className="text-muted-foreground text-sm">
              {t('userDetails.status')}
            </strong>
            <p className="mt-2 text-sm text-foreground">
              {user.description || t('userDetails.noDescription')}
            </p>
          </div>

          <div className="flex-1 ml-auto">
            <Button
              tabIndex={-1}
              variant="outline"
              onClick={handleRemoveFriend}
              disabled={isPending}
              className="text-red-500 w-full"
            >
              <UserRoundX className="w-4 h-4 " />
              {t('userSearch.chatUserDetails.removeFriend')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}