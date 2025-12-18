import { Button } from "@/components/ui/button";
import { useMaskAsReadMutation } from "@/http/hooks/notification.hooks";
import { CheckCheck } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

interface NotificationHeaderProps {
  activeTab: 'unread' | 'read';
  onTabChange: (tab: 'unread' | 'read') => void;
  unreadCount?: number;
  unreadNotificationsIds?: number[];
}

export const NotificationHeader = memo(({
  activeTab,
  onTabChange,
  // unreadCount,
  unreadNotificationsIds
}: NotificationHeaderProps) => {
  const { t } = useTranslation()

  const { mutateAsync: maskAsReadFn, isPending } = useMaskAsReadMutation()

  async function handleMarkAllAsRead() {
    await maskAsReadFn(unreadNotificationsIds ?? []);
  }

  const hasUnreadNotifications =
    unreadNotificationsIds && unreadNotificationsIds.length > 0;

  const isButtonDisabled =
    isPending ||
    activeTab === "read" ||
    !hasUnreadNotifications;

  return (
    <>
      <div>
        <div className="flex items-center justify-between px-4 pt-2 pb-1">
          <div className="text-sm font-semibold">{t("notifications.title")}</div>
          <Button
            disabled={isButtonDisabled}
            onClick={handleMarkAllAsRead}
            className="text-xs ml-2 flex items-center gap-1 p-0 shadow-none text-secondary-foreground/80 bg-transparent hover:bg-transparent hover:text-secondary-foreground"
          >
            <CheckCheck className="size-4" />
            {t("notifications.markAsRead.plural")}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <div className="px-4">
            <button
              onClick={() => onTabChange('unread')}
              className={`text-xs py-1 px-2 transition-colors cursor-pointer ${activeTab === 'unread'
                ? 'border-b-2 border-primary font-semibold text-foreground'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {t("notifications.tabs.unread")}
            </button>
            <button
              onClick={() => onTabChange('read')}
              className={`text-xs py-1 px-2 transition-colors cursor-pointer ${activeTab === 'read'
                ? 'border-b-2 border-primary font-semibold text-foreground'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {t("notifications.tabs.read")}
            </button>
          </div>
        </div>

      </div>
    </>
  );
});

NotificationHeader.displayName = "NotificationHeader";
