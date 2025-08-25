import { useAuth } from "@/contexts/auth-provider"
import { AvatarFallback } from "@radix-ui/react-avatar"
import { getInitialName } from "@/lib/get-initial-name"
import { Avatar } from "../ui/avatar";
import { Badge } from "../ui/badge";

export function HeaderFriends() {
  const { user } = useAuth()
  const initialName = getInitialName(user?.name);

  return (
    <div className="flex items-center space-x-2">
      <div>
        <Avatar className="bg-primary flex items-center justify-center w-[1.9em] h-[1.9em] text-[12px] text-secondary">
          <AvatarFallback>
            {initialName}
          </AvatarFallback>
        </Avatar>


      </div>
      <div className="flex space-x-1">
        <p className="font-medium text-[12px]">See your friends</p>
        <Badge className="sm:block hidden rounded-full bg-accent/60 px-1.5">
          <p className="text-[10px] text-foreground m-0">Hobby</p>
        </Badge>
      </div>
    </div>

  )
} 