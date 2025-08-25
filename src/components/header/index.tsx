import { LyraIcon } from "@/components/logos/lyra-icon";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/ui/modo-toggle";
import { HeaderNavigation } from "./header-navigation";

export function Header() {
  // const { logout } = useAuth()
  // const navigate = useNavigate()

  // const handleLogout = () => {
  //   logout()
  //   navigate({
  //     to: "/sign-in"
  //   })
  // }

  return (
    <div className="border-b bg-accent/20 px-4 pt-4 space-y-2">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-4">
          <LyraIcon height="h-7" />
          <div className="h-6 w-px bg-border" />

          <Badge className="rounded-full bg-accent/60">
            <p className="text-[11px] font-light text-foreground/60">BETA</p>
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          {/* <SearchUser /> */}
          {/* <Notification /> */}
          <ModeToggle />
          {/* <HeaderAccount /> */}
        </div>
      </div>
      <div>
        <HeaderNavigation />
      </div>
    </div>
  )
}