import { memo } from "react";

import { NotificationItem } from "./notification-item";
import { NotificationEmpty } from "./notification-empty";
import { NotificationSkeleton } from "./notification-skeleton";

// types
import type { ExtendedNotificationDataModel } from "@/@types/notification";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

interface NotificationListProps {
  notifications: ExtendedNotificationDataModel[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const NotificationList = memo(({
  notifications,
  isLoading,
  error
}: NotificationListProps) => {
  const { t } = useTranslation()
  if (error) {
    return (
      <div className="flex flex-col text-center items-center text-sm text-muted-foreground px-4 gap-2 py-6">
        {t("notifications.error.loading")}
      </div>
    );
  }

  if (isLoading && !notifications) {
    return (
      <div className="max-h-[300px] space-y-1">
        <NotificationSkeleton />
        <NotificationSkeleton />
        <NotificationSkeleton />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return <NotificationEmpty />;
  }

  return (
    <ScrollArea className="max-h-[300px] w-full">
      <div className="space-y-1">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </ScrollArea>
  );
});

NotificationList.displayName = "NotificationList";