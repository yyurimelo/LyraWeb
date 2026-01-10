import { memo } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface FriendRequestSkeletonProps {
  count?: number;
}

function FriendRequestItemSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 border-b border-border">
      <Skeleton className="size-12 rounded-full" />

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-20" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const FriendRequestSkeleton = memo(({ count = 5 }: FriendRequestSkeletonProps) => {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, index) => (
        <FriendRequestItemSkeleton key={index} />
      ))}
    </div>
  );
});

FriendRequestSkeleton.displayName = "FriendRequestSkeleton";
