import { Bell } from "@phosphor-icons/react";
import { useState } from "react";

// components
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// sections
import { NotificationHeader } from "./sections/notification-header";
import { NotificationList } from "./sections/notification-list";

// hooks
import {
  useUnreadNotificationsQuery,
  useReadNotificationsQuery,
  useUnreadNotificationsCountQuery
} from "@/http/hooks/notification.hooks";
import { useAuth } from "@/contexts/auth-provider";
import type { ExtendedNotificationDataModel } from "@/@types/notification";

export function NotificationDropdown() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');

  // Fetch unread notifications - only when popover is open and tab is unread
  const {
    data: unreadNotifications,
    isLoading: isLoadingUnread,
    error: unreadError
  } = useUnreadNotificationsQuery(isAuthenticated && isOpen && activeTab === 'unread');

  // Fetch read notifications - only when popover is open and tab is read
  const {
    data: readNotifications,
    isLoading: isLoadingRead,
    error: readError
  } = useReadNotificationsQuery(isAuthenticated && isOpen && activeTab === 'read');

  // Fetch unread count for badge
  const {
    data: unreadCountData
  } = useUnreadNotificationsCountQuery();

  const unreadCount = unreadCountData || 0;

  // Determine current data based on active tab
  const currentData = activeTab === 'unread' ? unreadNotifications : readNotifications;
  const currentLoading = activeTab === 'unread' ? isLoadingUnread : isLoadingRead;
  const currentError = activeTab === 'unread' ? unreadError : readError;

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
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] p-0"
        align="end"
        sideOffset={4}
      >
        <NotificationHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadCount={unreadCount}
        />
        <NotificationList
          notifications={currentData as ExtendedNotificationDataModel[]}
          isLoading={currentLoading}
          error={currentError}
        />
      </PopoverContent>
    </Popover>
  );
}