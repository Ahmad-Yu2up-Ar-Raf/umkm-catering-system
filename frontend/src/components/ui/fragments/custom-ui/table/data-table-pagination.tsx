"use client"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/fragments/shadcn-ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import type { Pagination } from "@/types/pagination-type"
import { usePagination, DOTS } from "@/hooks/use-pagination"

const PER_PAGE_OPTIONS = [10, 25, 50, 100]

interface DataTablePaginationProps {
  pagination: Pagination
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  isLoading?: boolean
}

/** Prev/next + per-page size for server-side paginated admin tables — minimalist, transparent. */
export function DataTablePagination({
  pagination,
  onPageChange,
  onPerPageChange,
  isLoading = false,
}: DataTablePaginationProps) {
  const { total, currentPage, lastPage, perPage, hasMore } = pagination

  const paginationRange = usePagination({
    currentPage,
    totalCount: total,
    pageSize: perPage,
  })

  return (
    <div className="flex flex-col items-center justify-between gap-3 px-2 py-3 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Menampilkan <span className="font-medium text-foreground">{total}</span> paket
      </p>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 pe-2">
          <span className="text-xs text-muted-foreground">Per halaman</span>
          <Select
            value={String(perPage)}
            onValueChange={(value) => onPerPageChange(Number(value))}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 w-16 bg-transparent" aria-label="Jumlah per halaman">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              {PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Halaman sebelumnya"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isLoading || currentPage <= 1}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Button>

        <div className="flex items-center gap-1">
          {paginationRange?.map((pageNumber, idx) => {
            if (pageNumber === DOTS) {
              return (
                <span key={`dots-${idx}`} className="px-1 text-xs text-muted-foreground">
                  &#8230;
                </span>
              )
            }

            const page = pageNumber as number
            const isActive = page === currentPage

            return (
              <Button
                key={page}
                type="button"
                variant={isActive ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className="h-7 w-7 text-xs tabular-nums"
              >
                {page}
              </Button>
            )
          })}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Halaman berikutnya"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLoading || !hasMore || currentPage >= lastPage}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      </div>
    </div>
  )
}
