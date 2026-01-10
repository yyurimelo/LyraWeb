export function UserSearchSkeleton() {
  return (
    <div className="space-y-1">
      {[...Array(1)].map((_, index) => (
        <div
          key={index}
          className="flex items-center p-3 rounded-lg animate-pulse"
        >
          <div className="w-10 h-10 bg-muted rounded-full"></div>
          <div className="flex-1 min-w-0 ml-3">
            <div className="flex items-center gap-2 min-w-0 mb-1">
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <div className="h-3 bg-muted rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}