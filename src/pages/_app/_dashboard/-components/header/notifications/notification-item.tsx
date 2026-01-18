import { Dot, EllipsisVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { memo } from "react";

// types
import type { ExtendedNotificationDataModel } from "@/@types/notification";

// mappers
import { notificationTypeIconMap } from "@/shared/mappers/notification-type-icon-map";

// hooks
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// services
import { useNotificationMessage } from "@/shared/http/services/notification-message.service";
import { isNotificationUnread } from "@/shared/helpers/notification.helpers";

// ui
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";

// icons
import { Checks } from "@phosphor-icons/react";
import { useMaskAsReadMutation } from "@/shared/http/hooks/notification.hooks";

interface NotificationItemProps {
  notification: ExtendedNotificationDataModel;
  activeTab: 'unread' | 'read';
  onClick?: (notification: ExtendedNotificationDataModel) => Promise<void>;
  isLoading?: boolean;
}

export const NotificationItem = memo(
  ({ notification, activeTab, onClick, isLoading }: NotificationItemProps) => {
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

    async function handleMarkAllAsRead(e: React.MouseEvent) {
      e.preventDefault()
      e.stopPropagation() // Impede que o clique se propague para abrir user search
      await maskAsReadFn([Number(notification.id)]);
    }

    async function handleClick() {
      if (!notification.id) return;

      if (onClick && notification.type === "InviteFriend") {
        await onClick(notification);
      }
    }

    return (
      <div className="text-sm transition-colors">
        <div
          className={cn(
            "hover:bg-accent/40 rounded-sm relative p-3 group",
            onClick && notification.type === "InviteFriend" && notification.id && isNotificationUnread(notification.status) && "cursor-pointer",
            isLoading && "opacity-50 pointer-events-none"
          )}
          onClick={handleClick}
        >
          {activeTab === "unread" && isNotificationUnread(notification.status) && (
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
                  onClick={(e) => e.stopPropagation()} // Impede propagação
                >
                  <EllipsisVertical className="h-4 w-4" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleMarkAllAsRead(e as any)
                  }}
                  disabled={isPending}
                >
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
                !isNotificationUnread(notification.status)
                  ? "text-muted-foreground"
                  : "text-primary"
              )}
            />

            <div className="flex flex-col gap-[2px] flex-1 min-w-0">
              <div className="flex items-center">
                <span
                  className={cn(
                    "text-[11px]",
                    !isNotificationUnread(notification.status)
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
