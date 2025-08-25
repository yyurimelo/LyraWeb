// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "@phosphor-icons/react";

export function HeaderNotification() {
  return (
    <Button
      size="icon"
      variant="outline"
      className="relative"
      aria-label="Open notifications"
    >
      <Bell className="size-5" />
      {/* {unreadCount > 0 && (
            <Badge className="absolute -top-2 left-full min-w-5 -translate-x-1/2 px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )} */}
    </Button>
  )
}