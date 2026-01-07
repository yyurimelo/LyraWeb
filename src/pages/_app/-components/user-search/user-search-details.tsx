"use client";

import { formatDistanceToNow } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";


// components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Separator } from "@/shared/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

// icons
import {
  UserRoundCheck,
  UserRoundPlus,
  UserRoundX,
} from "lucide-react";

// hooks
import { useAuth } from "@/contexts/auth-provider";
import {
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useCancelFriendRequestMutation,
  useCheckFriendshipStatus
} from "@/shared/http/hooks/friend-request.hooks";

// types
import type { UserDataModel } from "@/@types/user/user-data-model";
import { getInitialName } from "@/lib/get-initial-name";
import { useRemoveFriendMutation } from "@/shared/http/hooks/user.hooks";

interface UserSearchDetailsProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: UserDataModel | null;
}

export function UserSearchDetails({ open, setOpen, user }: UserSearchDetailsProps) {
  const { t, i18n } = useTranslation();
  const { user: loggedUser } = useAuth();
  const loggedUserId = loggedUser?.userIdentifier;

  const loggedUserIsMe = loggedUserId === user?.userIdentifier;
  const otherUserId = user?.userIdentifier || "";

  const { friendRequest, refetch: refetchFriendshipStatus } = useCheckFriendshipStatus(
    otherUserId,
    open
  );

  const { mutateAsync: sendInviteFriendFn, isPending: isSendingInvite } =
    useSendFriendRequestMutation();

  const { mutateAsync: acceptRequestFn, isPending: isAccepting } =
    useAcceptFriendRequestMutation();

  const { mutateAsync: cancelRequestFn, isPending: isRemoving } =
    useCancelFriendRequestMutation();

  const { mutateAsync: removeFriendFn, isPending: isRemovingFriend } =
    useRemoveFriendMutation();


  const isPending = isSendingInvite || isAccepting || isRemoving || isRemovingFriend;

  async function handleCancelRequest() {
    if (!friendRequest?.id) return;

    try {
      await cancelRequestFn(friendRequest.id);
      // Força atualização imediata do status
      await refetchFriendshipStatus();
    } catch (error) {
      console.error("Error canceling friend request:", error);
      toast.error(t('toasts.friendRequest.cancelError'));
    }
  }

  async function handleRemoveFriend() {
    if (!otherUserId) return;

    try {
      await removeFriendFn(otherUserId);
      // Força atualização imediata do status antes de fechar
      await refetchFriendshipStatus();
      setOpen(false);
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error(t('toasts.friendRequest.removeError'));
    }
  }

  // Aceitar solicitação de amizade
  async function handleAcceptRequest() {
    if (!friendRequest?.id) return;

    try {
      await acceptRequestFn(friendRequest.id);
      // Força atualização imediata do status
      await refetchFriendshipStatus();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error(t('toasts.friendRequest.acceptError'));
    }
  }

  // Enviar solicitação de amizade
  async function handleInviteFriend() {
    if (!otherUserId) return;

    try {
      await sendInviteFriendFn({ userIdentifier: otherUserId });
      // Força atualização imediata do status
      await refetchFriendshipStatus();
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error(t('toasts.friendRequest.sendError'));
    }
  }

  if (!user) return null;

  // Format friendship time
  const friendshipTime = friendRequest?.createdAt
    ? (() => {
      const dateStr =
        typeof friendRequest.createdAt === "string"
          ? friendRequest.createdAt
          : friendRequest.createdAt.toISOString();

      const finalDateStr =
        dateStr.includes("Z") ||
          dateStr.includes("+") ||
          (dateStr.includes("-", 10) && dateStr.length > 10)
          ? dateStr
          : dateStr + "Z";

      return formatDistanceToNow(new Date(finalDateStr), {
        locale: i18n.language === "en" ? enUS : ptBR,
        addSuffix: true,
      });
    })()
    : "";


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('userSearch.details.title')}</DialogTitle>
          <DialogDescription>
            {t('userSearch.details.description')}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <section>
          <div className="flex items-center">
            <Avatar className="size-20 rounded-full transition-transform">
              <AvatarImage
                src={user.avatarUser}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback
                style={{ backgroundColor: user.appearancePrimaryColor || 'hsl(var(--primary))' }}
                className="text-secondary-foreground font-semibold"
              >
                {getInitialName(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col ml-4 space-y-1">
              <h1 className="text-xl font-semibold">
                {user.name ?? t('userSearch.details.nameNotAvailable')}
              </h1>
              <p className="text-secondary-foreground/80 text-xs">
                {user.description ?? t('userSearch.details.descriptionNotAvailable')}
              </p>
            </div>
          </div>
        </section>

        <section className="w-full flex justify-end space-x-2">
          {friendRequest ? (
            <>
              {friendRequest.status === "Pending" && (
                <>
                  {friendRequest.senderId === loggedUserId ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          tabIndex={-1}
                          size="icon"
                          variant="outline"
                          onClick={handleCancelRequest}
                          disabled={isPending}
                        >
                          <UserRoundX className="w-4 h-4 text-red-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('userSearch.details.tooltips.cancelRequest')}</TooltipContent>
                    </Tooltip>
                  ) : (
                    // Eu recebi e posso aceitar ou rejeitar
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            tabIndex={-1}
                            size="icon"
                            variant="outline"
                            onClick={handleAcceptRequest}
                            disabled={isPending}
                          >
                            <UserRoundCheck className="w-4 h-4 text-emerald-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('userSearch.details.tooltips.acceptRequest')}</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            tabIndex={-1}
                            size="icon"
                            variant="outline"
                            onClick={handleCancelRequest}
                            disabled={isPending}
                          >
                            <UserRoundX className="w-4 h-4 text-red-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('userSearch.details.tooltips.rejectRequest')}</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </>
              )}

              {friendRequest.status === "Accepted" && (
                <section className="flex flex-col w-full space-y-2">
                  <div className="flex-1 ml-auto">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          tabIndex={-1}
                          size="icon"
                          variant="outline"
                          onClick={handleRemoveFriend}
                        >
                          <UserRoundX className="w-4 h-4 text-red-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('userSearch.details.tooltips.removeFriend')}</TooltipContent>
                    </Tooltip>
                  </div>

                  <Separator orientation="horizontal" className="my-2" />

                  <div className="flex w-full justify-end">
                    <span className="text-muted-foreground/80 text-[11px]">
                      {t('userSearch.details.friendshipStatus', { time: friendshipTime })}
                    </span>
                  </div>
                </section>
              )}
            </>
          ) : (
            !loggedUserIsMe && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    tabIndex={-1}
                    size="icon"
                    variant="outline"
                    onClick={handleInviteFriend}
                    disabled={isPending}
                  >
                    <UserRoundPlus className="w-4 h-4 text-emerald-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('userSearch.details.tooltips.sendRequest')}</TooltipContent>
              </Tooltip>
            )
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
}
