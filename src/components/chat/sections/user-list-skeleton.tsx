import { Skeleton } from "@/components/ui/skeleton";

function UserListItemSkeleton() {
  return (
    <div
      className="
        flex items-start p-3 rounded-lg
        border border-border
      "
    >
      {/* Avatar */}
      <Skeleton className="size-11 rounded-full" />

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 ml-3">
        {/* Nome + horário */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-10" />
        </div>

        {/* Última mensagem */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

interface UserListSkeletonProps {
  count?: number;
}

export function UserListSkeleton({ count = 6 }: UserListSkeletonProps) {
  return (
    <div className="overflow-y-auto h-full space-y-1 px-4">
      {Array.from({ length: count }).map((_, index) => (
        <UserListItemSkeleton key={index} />
      ))}
    </div>
  );
}