import { memo } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";

// components
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Check, X } from "lucide-react";

// types
import type { FriendRequestDataModel } from "@/@types/friend-request/friend-request-data";

// helpers
import { getInitialName } from "@/lib/get-initial-name";

// hooks
import { useAcceptFriendRequestMutation, useCancelFriendRequestMutation } from "@/shared/http/hooks/friend-request.hooks";

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.locale('pt-br');

interface FriendRequestItemProps {
  request: FriendRequestDataModel;
  onActionSuccess?: () => void;
}

export const FriendRequestItem = memo(({
  request,
  onActionSuccess,
}: FriendRequestItemProps) => {
  const { t, i18n } = useTranslation();

  const { mutate: acceptRequest, isPending: isAcceptingMutation } = useAcceptFriendRequestMutation();
  const { mutate: cancelRequest, isPending: isCancelingMutation } = useCancelFriendRequestMutation();

  const isPending = request.status === "Pending";

  // Update dayjs locale based on current language
  const currentLanguage = i18n.language;
  if (currentLanguage === 'pt-BR' || currentLanguage === 'pt') {
    dayjs.locale('pt-br');
  } else {
    dayjs.locale('en');
  }

  const handleAccept = () => {
    acceptRequest(request.id, {
      onSuccess: () => {
        onActionSuccess?.();
      }
    });
  };

  const handleCancel = () => {
    cancelRequest(request.id, {
      onSuccess: () => {
        onActionSuccess?.();
      }
    });
  };

  const formatRelativeTime = (date: Date | string) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString();
    const finalDateStr = dateStr.includes('Z') || dateStr.includes('+')
      ? dateStr
      : dateStr + 'Z';
    return dayjs(finalDateStr).fromNow();
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-accent/25 border cursor-pointer rounded-md last:border-b-0 hover:bg-muted/30 transition-colors">
      {/* Avatar */}
      <Avatar className="size-11 rounded-full transition-transform">
        <AvatarImage
          src={request.senderAvatarUser}
          alt={request.senderName}
          className="object-cover"
        />
        <AvatarFallback
          style={{ backgroundColor: request.senderPrimaryColor || 'hsl(var(--primary))' }}
          className="text-secondary-foreground font-semibold text-sm"
        >
          {getInitialName(request.senderName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex items-center justify-between w-full">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm truncate">
            {request.senderName}
          </h3>
        </div>
        <div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(request.createdAt)}
            </span>
            {isPending && (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAccept}
                  disabled={isAcceptingMutation || isCancelingMutation}
                  className="h-7 px-2 text-xs gap-1 text-emerald-500"
                >
                  <Check className="size-3" />
                  {t('friendRequest.actions.accept')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isAcceptingMutation || isCancelingMutation}
                  className="h-7 px-2 text-xs gap-1 text-destructive"
                >
                  <X className="size-3" />
                  {t('friendRequest.actions.cancel')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

FriendRequestItem.displayName = "FriendRequestItem";
