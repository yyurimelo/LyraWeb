import { Bell } from "@phosphor-icons/react";
import { useState } from "react";

// components
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Badge } from "@/shared/components/ui/badge";

// sections
import { NotificationHeader } from "./notification-header";
import { NotificationList } from "./notification-list";
import { UserSearchDetails } from "@/pages/_app/_dashboard/-components/user-search";

// hooks
import {
  useUnreadNotificationsQuery,
  useReadNotificationsQuery,
  useUnreadNotificationsCountQuery,
  useNotificationClick,
} from "@/shared/http/hooks/notification.hooks";
import { useAuth } from "@/contexts/auth-provider";
import type { ExtendedNotificationDataModel } from "@/@types/notification";
import { useSignalRNotifications } from "@/signalr/use-signalr-notifications";


export function Notification() {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');

  useSignalRNotifications({
    userId: user?.userIdentifier ?? '',
    enabled: isAuthenticated,
  });

  const { data: unreadNotifications, isLoading: isLoadingUnread, error: unreadError } =
    useUnreadNotificationsQuery(isAuthenticated && isOpen && activeTab === 'unread');

  const { data: readNotifications, isLoading: isLoadingRead, error: readError } =
    useReadNotificationsQuery(isAuthenticated && isOpen && activeTab === 'read');

  const { data: unreadCountData } = useUnreadNotificationsCountQuery();
  const unreadCount = unreadCountData ?? 0;

  const currentData = activeTab === 'unread' ? unreadNotifications : readNotifications;
  const currentLoading = activeTab === 'unread' ? isLoadingUnread : isLoadingRead;
  const currentError = activeTab === 'unread' ? unreadError : readError;

  // Hook para clique em notificação
  const {
    selectedUser,
    userDetailsDialogOpen,
    isLoadingUser,
    setUserDetailsDialogOpen,
    handleNotificationClick,
  } = useNotificationClick();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="relative"
          aria-label="Open notifications"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 left-full min-w-5 -translate-x-1/2 px-1 h-5 flex items-center justify-center text-xs">
              {unreadCount > 3 ? `${unreadCount}+` : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-screen sm:w-[380px] p-0"
        align="end"
        sideOffset={12}
      >
        <NotificationHeader
          unreadNotificationsIds={unreadNotifications?.map((x) => Number(x.id)) ?? []}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadCount={unreadCount}
        />
        <NotificationList
          notifications={currentData as ExtendedNotificationDataModel[]}
          isLoading={currentLoading}
          error={currentError}
          activeTab={activeTab}
          onNotificationClick={handleNotificationClick}
          isLoadingNotification={isLoadingUser}
        />
      </PopoverContent>

      {selectedUser && (
        <UserSearchDetails
          open={userDetailsDialogOpen}
          setOpen={setUserDetailsDialogOpen}
          user={selectedUser}
        />
      )}
    </Popover>
  );
}
