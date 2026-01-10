import { memo } from "react";
import { useTranslation } from "react-i18next";

export const FriendRequestEmpty = memo(() => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 className="text-sm font-semibold text-muted-foreground mb-1">
        {t('friendRequest.empty.title')}
      </h3>
      <p className="text-xs text-muted-foreground/70">
        {t('friendRequest.empty.description')}
      </p>
    </div>
  );
});

FriendRequestEmpty.displayName = "FriendRequestEmpty";
