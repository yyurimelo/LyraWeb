import { memo } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";

export const NotificationSkeleton = memo(() => {
  return (
    <div className="p-4 space-y-2">
      <div className="flex items-start gap-3">
        <Skeleton className="size-5 rounded" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-1" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
});

NotificationSkeleton.displayName = "NotificationSkeleton";