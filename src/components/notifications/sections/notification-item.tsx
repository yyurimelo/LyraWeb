import { Dot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { memo } from "react";

// types
import type { ExtendedNotificationDataModel } from "@/@types/notification";

// mappers
import { notificationTypeIconMap } from "@/app/_mappers/notification-type-icon-map";
import { notificationTypeMap } from "@/app/_mappers/notification-type-map";

// hooks
import { useNotificationMessage } from "@/lib/notifications/notification-message.service";

interface NotificationItemProps {
  notification: ExtendedNotificationDataModel;
}

export const NotificationItem = memo(({ notification }: NotificationItemProps) => {
  const { getNotificationMessage } = useNotificationMessage();
  const { type, createdAt } = notification;

  // Convert NotificationTypeEnum to numeric key for mappers
  const typeKey = type === 'InviteFriend' ? 0 :
    type === 'AcceptFriendRequest' ? 1 :
      type === 'NewMessage' ? 2 :
        type === 'System' ? 3 : 4; // Default to Warning

  const Icon = notificationTypeIconMap[typeKey] || notificationTypeIconMap[4];

  const notificationMessage = getNotificationMessage(notification);

  return (
    <div className="p-2 text-sm transition-colors">
      <div className="hover:bg-accent rounded-md relative flex items-start gap-3 p-4">
        <div className="flex-1 space-y-1">
          <div className="flex space-x-2 w-full">
            <Icon size={21} className="text-primary flex-shrink-0" />
            <div className="flex flex-col gap-[2px] flex-1 min-w-0">
              <div className="flex items-center">
                <span className="text-[11px] text-primary">
                  {notificationTypeMap[typeKey] || notificationMessage.title}
                </span>
                <Dot className="text-muted-foreground/50 size-[15px]" />
                <span className="text-muted-foreground/80 text-[11px]">
                  {createdAt
                    ? formatDistanceToNow(new Date(createdAt), {
                      locale: ptBR,
                      addSuffix: true,
                    })
                    : "Agora"}
                </span>
              </div>
              <span className="text-sm text-foreground break-words">
                {notificationMessage.message || "Sem conteúdo"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = "NotificationItem";