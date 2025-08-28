import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DataPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  total?: number;
  limit?: number;
}

export function DataPagination({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  total,
  limit,
}: DataPaginationProps) {
  const generatePageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      const startPage = Math.max(2, currentPage - 2);
      const endPage = Math.min(totalPages - 1, currentPage + 2);

      // Add ellipsis if there's a gap after first page
      if (startPage > 2) {
        pages.push("ellipsis");
      }

      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if there's a gap before last page
      if (endPage < totalPages - 1) {
        pages.push("ellipsis");
      }

      // Always show last page if there's more than one page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return showInfo && total !== undefined && limit !== undefined ? (
      <div className="text-sm text-muted-foreground">
        Showing {total} {total === 1 ? "result" : "results"}
      </div>
    ) : null;
  }

  const pages = generatePageNumbers();
  const startResult = ((currentPage - 1) * (limit || 12)) + 1;
  const endResult = Math.min(currentPage * (limit || 12), total || 0);

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      {showInfo && total !== undefined && limit !== undefined && (
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          Showing {startResult} to {endResult} of {total} results
        </div>
      )}
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) {
                  onPageChange(currentPage - 1);
                }
              }}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) {
                  onPageChange(currentPage + 1);
                }
              }}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function usePagination(initialPage = 1, initialLimit = 12) {
  const [page, setPage] = React.useState(initialPage);
  const [limit, setLimit] = React.useState(initialLimit);

  const onPageChange = React.useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const onLimitChange = React.useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  const reset = React.useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    limit,
    onPageChange,
    onLimitChange,
    reset,
  };
}