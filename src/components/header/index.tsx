import { LyraIcon } from "@/components/logos/lyra-icon";
import { ModeToggle } from "@/components/ui/modo-toggle";
import { HeaderNavigation } from "./header-navigation";
import { HeaderAccount } from "./header-account";
import { HeaderFriends } from "./header-friends";
import { HeaderNotification } from "./header-notification";
import SearchUser from "../ui/search-user";

export function Header() {

  return (
    <div className="border-b bg-sidebar px-3 pt-4 space-y-2">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <LyraIcon height="h-7 text-primary" />
          </div>
          <div className="hidden md:block h-6 w-px bg-border" />
          <HeaderFriends />
        </div>


        <div className="flex items-center space-x-2">
          <SearchUser />
          <HeaderNotification />
          <ModeToggle />
          <HeaderAccount />
        </div>
      </div>
      <div>
        <HeaderNavigation />
      </div>
    </div>
  )
}