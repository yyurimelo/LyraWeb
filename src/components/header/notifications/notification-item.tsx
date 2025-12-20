import { Dot, EllipsisVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { memo } from "react";

// types
import type { ExtendedNotificationDataModel } from "@/@types/notification";

// mappers
import { notificationTypeIconMap } from "@/mappers/notification-type-icon-map";

// hooks
import { useNotificationMessage } from "@/lib/notifications/notification-message.service";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// ui
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// icons
import { Checks } from "@phosphor-icons/react";
import { useMaskAsReadMutation } from "@/http/hooks/notification.hooks";

interface NotificationItemProps {
  notification: ExtendedNotificationDataModel;
  activeTab: 'unread' | 'read';
}

export const NotificationItem = memo(
  ({ notification, activeTab }: NotificationItemProps) => {
    const { getNotificationMessage } = useNotificationMessage();
    const { type, createdAt } = notification;
    const { i18n } = useTranslation();

    // Convert NotificationTypeEnum to numeric key for mappers
    const typeKey =
      type === "InviteFriend"
        ? 0
        : type === "AcceptFriendRequest"
          ? 1
          : type === "NewMessage"
            ? 2
            : type === "System"
              ? 3
              : 4;

    const Icon = notificationTypeIconMap[typeKey] || notificationTypeIconMap[4];
    const notificationMessage = getNotificationMessage(notification);

    const { mutateAsync: maskAsReadFn, isPending } = useMaskAsReadMutation()

    async function handleMarkAllAsRead() {
      await maskAsReadFn([Number(notification.id)]);
    }

    return (
      <div className="text-sm transition-colors">
        <div className="hover:bg-accent/40 cursor-pointer rounded-sm relative p-3 group">
          {activeTab === "unread" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="
                    absolute top-0 right-0 h-7 w-7 p-0
                    opacity-100 pointer-events-auto
                    md:opacity-0 md:pointer-events-none
                    md:group-hover:opacity-100 md:group-hover:pointer-events-auto
                    data-[state=open]:opacity-100
                    data-[state=open]:bg-muted
                    transition-opacity
                  "
                >
                  <EllipsisVertical className="h-4 w-4" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2" onClick={handleMarkAllAsRead} disabled={isPending}>
                  <Checks size={16} />
                  <span>Marcar como lida</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Conteúdo */}
          <div className="flex items-start gap-3">
            <Icon
              size={21}
              className={cn(
                "flex-shrink-0 mt-[2px]",
                String(notification.status) === "Read"
                  ? "text-muted-foreground"
                  : "text-primary"
              )}
            />

            <div className="flex flex-col gap-[2px] flex-1 min-w-0">
              <div className="flex items-center">
                <span
                  className={cn(
                    "text-[11px]",
                    String(notification.status) === "Read"
                      ? "text-muted-foreground"
                      : "text-primary"
                  )}
                >
                  {notificationMessage.title}
                </span>

                <Dot className="text-muted-foreground/50 size-[15px]" />

                <span className="text-muted-foreground/80 text-[11px]">
                  {createdAt
                    ? (() => {
                      const dateStr =
                        typeof createdAt === "string"
                          ? createdAt
                          : createdAt.toISOString();

                      const finalDateStr =
                        dateStr.includes("Z") ||
                          dateStr.includes("+") ||
                          (dateStr.includes("-", 10) && dateStr.length > 10)
                          ? dateStr
                          : dateStr + "Z";

                      return formatDistanceToNow(
                        new Date(finalDateStr),
                        {
                          locale:
                            i18n.language === "en" ? enUS : ptBR,
                          addSuffix: true,
                        }
                      );
                    })()
                    : "Agora"}
                </span>
              </div>

              <span className="text-sm text-foreground break-words pr-6">
                {notificationMessage.message}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

NotificationItem.displayName = "NotificationItem";
