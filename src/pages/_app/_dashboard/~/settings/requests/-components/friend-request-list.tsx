import { memo } from "react";
import { useTranslation } from "react-i18next";

// components
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { CloudAlert } from "lucide-react";

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
  searchQuery: string;
}

export const FriendRequestList = memo(({
  allRequests,
  isLoading,
  isError,
}: FriendRequestListProps) => {

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
    return <FriendRequestSkeleton count={10} />;
  }

  if (!allRequests || allRequests.length === 0) {
    return <FriendRequestEmpty />;
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2">
        {allRequests.map((request) => (
          <FriendRequestItem
            key={request.id}
            request={request}
          />
        ))}
      </div>
    </ScrollArea>
  );
});

FriendRequestList.displayName = "FriendRequestList";
