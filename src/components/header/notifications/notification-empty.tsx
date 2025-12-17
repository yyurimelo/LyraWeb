import { Bell } from "@phosphor-icons/react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

export const NotificationEmpty = memo(() => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col text-center items-center text-sm text-muted-foreground p-20 gap-2">
      <Bell className="size-8" weight="duotone" />
      {t("notifications.empty.newNotifications")}
    </div>
  );
});

NotificationEmpty.displayName = "NotificationEmpty";