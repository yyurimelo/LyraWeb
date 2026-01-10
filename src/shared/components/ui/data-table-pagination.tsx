import { memo } from "react";
import { Button } from "@/shared/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  className?: string;
}

/**
 * Generic pagination component with record counter and page controls.
 *
 * @param currentPage - Current active page (1-based)
 * @param totalPages - Total number of pages
 * @param totalRecords - Total number of records
 * @param pageSize - Number of records per page
 * @param onPageChange - Callback when page changes
 * @param onPageSizeChange - Optional callback when page size changes
 * @param showPageSizeSelector - Show page size selector dropdown (default: false)
 * @param pageSizeOptions - Options for page size selector (default: [10, 20, 50])
 * @param className - Optional CSS class for the container
 */
export const DataTablePagination = memo(({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = false,
  pageSizeOptions = [10, 20, 50],
  className,
}: DataTablePaginationProps) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className={className}>
      <div className="flex items-end justify-between">
        {/* Record Counter */}
        <div className="flex flex-col text-sm">
          <p className="text-muted-foreground">{totalRecords} registro(s)</p>
          <p>
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          </p>
        </div>

        {/* Page Controls */}
        <div className="flex items-center gap-2">
          {/* First Page */}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(1)}
            disabled={isFirstPage}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Primeira página</span>
          </Button>

          {/* Previous Page */}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isFirstPage}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Página anterior</span>
          </Button>

          {/* Next Page */}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLastPage}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Próxima página</span>
          </Button>

          {/* Last Page */}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(totalPages)}
            disabled={isLastPage}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Última página</span>
          </Button>
        </div>

        {/* Optional: Page Size Selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Itens por página:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
});

DataTablePagination.displayName = "DataTablePagination";
