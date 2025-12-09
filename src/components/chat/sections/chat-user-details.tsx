import * as React from "react"
import type { UserGetAllFriendsDataModel } from "../../../@types/user/user-get-all-friends"
import {
  Sheet,
  SheetContent, SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { getInitialName } from "@/lib/get-initial-name"
import type { Dispatch } from "react"

interface ChatUserDetailsProps {
  user: UserGetAllFriendsDataModel
  open: boolean;
  setOpen: Dispatch<React.SetStateAction<boolean>>;
}

export function ChatUserDetails({ user, open, setOpen }: ChatUserDetailsProps) {

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle>Dados do usuário</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* User Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={user.AvatarUser}
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

          <div className="ml-4">
            <strong className="text-muted-foreground text-sm">
              Recado
            </strong>
            <p className="mt-2 text-sm text-foreground">
              {user.description || "Nenhuma descrição fornecida."}
            </p>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}