import { memo, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";

// components
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { CloudAlert, LoaderCircle } from "lucide-react";

// custom components
import { FriendRequestItem } from "./friend-request-item";
import { FriendRequestSkeleton } from "./friend-request-skeleton";
import { FriendRequestEmpty } from "./friend-request-empty";

// types
import type { FriendRequestDataModel } from "@/@types/friend-request/friend-request-data";

interface FriendRequestListProps {
  allRequests: FriendRequestDataModel[] | undefined;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  searchQuery: string;
}

export const FriendRequestList = memo(({
  allRequests,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  searchQuery,
}: FriendRequestListProps) => {
  const { t } = useTranslation();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!scrollAreaRef.current || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const scrollViewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
    if (!scrollViewport) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollViewport;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    const threshold = 0.9; // Load more when 90% scrolled

    if (scrollPercentage >= threshold) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const scrollViewport = scrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;

    if (!scrollViewport) return;

    scrollViewport.addEventListener('scroll', handleScroll);

    return () => {
      scrollViewport.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <CloudAlert className='text-destructive' />
        </div>
      </div>
    );
  }

  if (isLoading && !allRequests) {
    return <FriendRequestSkeleton count={5} />;
  }

  if (!allRequests || allRequests.length === 0) {
    return <FriendRequestEmpty />;
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="h-[calc(100vh-300px)] min-h-[400px]">
      <div className="space-y-2">
        {allRequests.map((request) => (
          <FriendRequestItem
            key={request.id}
            request={request}
          />
        ))}

        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4">
            <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!hasNextPage && allRequests.length > 0 && (
          <div className="py-4 text-center">
            <p className="text-xs text-muted-foreground">
              {t('friendRequest.endOfResults')}
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
});

FriendRequestList.displayName = "FriendRequestList";
