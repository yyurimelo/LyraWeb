import { createFileRoute } from '@tanstack/react-router';
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

// components
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";
import { Search, RefreshCw } from "lucide-react";

// custom components
import { FriendRequestList } from "./-components/friend-request-list";

// hooks
import { useFriendRequestsQuery } from "@/shared/http/hooks/friend-request.hooks";

export const Route = createFileRoute('/_app/_dashboard/~/settings/requests/')({
  component: Requests,
})

function Requests() {
  const { t } = useTranslation();
  const [searchName, setSearchName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useFriendRequestsQuery({
    name: searchQuery,
    page,
    pageSize,
    enabled: true,
  });

  const allRequests = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalRecords = data?.totalRecords ?? 0;

  useEffect(() => {
    const scrollContainer = document.querySelector('[data-slot="scroll-area-viewport"]');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page]);

  const handleSearch = useCallback(() => {
    setSearchQuery(searchName);
    setPage(1);
  }, [searchName]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="flex flex-col h-full space-y-4">

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t('friendRequest.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('friendRequest.description')}
        </p>
      </div>

      <div className="flex w-full items-center gap-2">
        <div className="relative flex-1 max-w-full">
          <Input
            type="text"
            placeholder={t('friendRequest.search.placeholder')}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pr-10"
          />

          {searchName && (
            <button
              onClick={() => {
                setSearchName("");
                setSearchQuery("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            >
              ×
            </button>
          )}
        </div>

        <Button
          onClick={handleSearch}
          variant="default"
          size="sm"
          className="gap-2 shrink-0"
        >
          <Search className="size-4" />
        </Button>

        <Button
          onClick={handleRefetch}
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>


      {searchQuery && (
        <div className="text-xs text-muted-foreground">
          {t('friendRequest.search.active', { query: searchQuery })}
        </div>
      )}

      <div className="flex-1 min-h-0">
        <FriendRequestList
          allRequests={allRequests}
          isLoading={isLoading}
          isError={isError}
          searchQuery={searchQuery}
          onActionSuccess={refetch}
        />
      </div>

      {allRequests.length > 0 && (
        <DataTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
