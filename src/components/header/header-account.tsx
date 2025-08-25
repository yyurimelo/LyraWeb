// components
import { Avatar } from "@/components/ui/avatar";
import { AvatarImageUser } from "@/components/ui/avatar-image-user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// icons
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { Link, useNavigate } from "@tanstack/react-router";

export function HeaderAccount() {
  const { user, logout } = useAuth()

  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate({
      to: "/sign-in"
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant={"ghost"}>
          <Avatar className="size-8 rounded-full">
            <AvatarImageUser
              src={user?.avatarUser || undefined}
              alt={user?.name}
              name={user?.name}
            />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={"bottom"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8 rounded-full">
              <AvatarImageUser
                src={user?.avatarUser || undefined}
                alt={user?.name}
                name={user?.name}
              />
            </Avatar>

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {user?.name}
              </span>
              <span className="truncate text-xs">{user?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <Link to="/~/settings">
            <DropdownMenuItem>
              Account Settings
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
