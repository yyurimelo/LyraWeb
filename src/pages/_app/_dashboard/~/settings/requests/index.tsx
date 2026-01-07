import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

// components
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Search, RefreshCw } from "lucide-react";

// custom components
import { FriendRequestList } from "../../../../-components/friend-request/friend-request-list";

// hooks
import { useFriendRequestsInfiniteQuery } from "@/shared/http/hooks/friend-request.hooks";

export const Route = createFileRoute('/_app/_dashboard/~/settings/requests/')({
  component: Requests,
})

function Requests() {
  const { t } = useTranslation();
  const [searchName, setSearchName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Infinite query for friend requests
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useFriendRequestsInfiniteQuery({
    name: searchQuery,
    pageSize: 2,
    enabled: true,
  });

  // Flatten all pages into single array
  const allRequests = data?.pages.flatMap((page) => page.data) ?? [];

  // Handle search - explicit action on button click
  const handleSearch = useCallback(() => {
    setSearchQuery(searchName);
  }, [searchName]);

  // Handle Enter key in input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // Handle refetch
  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchName("");
    setSearchQuery("");
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t('friendRequest.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('friendRequest.description')}
        </p>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="flex-1 flex items-center gap-2">
          <Input
            type="text"
            placeholder={t('friendRequest.search.placeholder')}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="max-w-sm"
          />
          <Button
            onClick={handleSearch}
            variant="default"
            size="sm"
            className="gap-2"
          >
            <Search className="size-4" />
          </Button>
          {searchQuery && (
            <Button
              onClick={handleClearSearch}
              variant="ghost"
              size="sm"
            >
              {t('friendRequest.search.clear')}
            </Button>
          )}
        </div>

        {/* Refetch Button */}
        <Button
          onClick={handleRefetch}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {/* Active Search Indicator */}
      {searchQuery && (
        <div className="text-xs text-muted-foreground">
          {t('friendRequest.search.active', { query: searchQuery })}
        </div>
      )}

      {/* Friend Requests List */}
      <FriendRequestList
        allRequests={allRequests}
        isLoading={isLoading}
        isError={isError}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        searchQuery={searchQuery}
      />
    </div>
  );
}
