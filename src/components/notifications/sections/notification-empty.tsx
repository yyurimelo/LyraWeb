import { Bell } from "@phosphor-icons/react";
import { memo } from "react";

export const NotificationEmpty = memo(() => {
  return (
    <div className="flex flex-col text-center items-center text-sm text-muted-foreground px-4 gap-2 py-6">
      <Bell className="size-8" weight="duotone" />
      Você não tem novas notificações
    </div>
  );
});

NotificationEmpty.displayName = "NotificationEmpty";