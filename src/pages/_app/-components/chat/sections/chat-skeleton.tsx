import { ChevronDown, MoreVertical } from 'lucide-react'

export function ChatSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-full max-h-full no-scrollbar">
      {/* Header Skeleton */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-3 bg-muted rounded w-24 animate-pulse"></div>
          </div>
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse flex items-center justify-center">
            <ChevronDown className="w-4 h-4 text-muted" />
          </div>
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse flex items-center justify-center">
            <MoreVertical className="w-4 h-4 text-muted" />
          </div>
        </div>
      </div>

      {/* Messages Area Skeleton */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Received message skeleton */}
        <div className="flex gap-3 max-w-[80%]">
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="h-4 bg-background rounded w-32 animate-pulse mb-2"></div>
              <div className="h-4 bg-background rounded w-24 animate-pulse mb-2"></div>
              <div className="h-4 bg-background rounded w-16 animate-pulse"></div>
            </div>
            <div className="h-3 bg-muted rounded w-20 animate-pulse px-1"></div>
          </div>
        </div>

        {/* Sent message skeleton */}
        <div className="flex gap-3 justify-end max-w-[80%] ml-auto">
          <div className="flex-1 space-y-2">
            <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3">
              <div className="h-4 bg-primary-foreground/20 rounded w-28 animate-pulse mb-2 ml-auto"></div>
              <div className="h-4 bg-primary-foreground/20 rounded w-20 animate-pulse ml-auto"></div>
            </div>
            <div className="h-3 bg-muted rounded w-20 animate-pulse px-1 text-right"></div>
          </div>
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse flex-shrink-0"></div>
        </div>

        {/* More message skeletons for realistic feel */}
        <div className="flex gap-3 max-w-[80%]">
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="h-4 bg-background rounded w-40 animate-pulse mb-2"></div>
              <div className="h-4 bg-background rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-3 bg-muted rounded w-20 animate-pulse px-1"></div>
          </div>
        </div>

        <div className="flex gap-3 justify-end max-w-[80%] ml-auto">
          <div className="flex-1 space-y-2">
            <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3">
              <div className="h-4 bg-primary-foreground/20 rounded w-36 animate-pulse ml-auto"></div>
            </div>
            <div className="h-3 bg-muted rounded w-20 animate-pulse px-1 text-right"></div>
          </div>
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse flex-shrink-0"></div>
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-muted rounded-full animate-pulse"></div>
          <div className="w-10 h-10 bg-primary rounded-full animate-pulse flex items-center justify-center">
            <div className="w-5 h-5 bg-primary-foreground rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}