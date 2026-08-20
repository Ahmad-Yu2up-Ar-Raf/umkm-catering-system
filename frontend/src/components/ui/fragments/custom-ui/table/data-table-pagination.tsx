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

const PER_PAGE_OPTIONS = [10, 25, 50, 100]

interface DataTablePaginationProps {
  pagination: Pagination
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  isLoading?: boolean
}

/** Prev/next + per-page size for server-side paginated admin tables. */
export function DataTablePagination({
  pagination,
  onPageChange,
  onPerPageChange,
  isLoading = false,
}: DataTablePaginationProps) {
  const { total, currentPage, lastPage, perPage, hasMore } = pagination

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row">
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
            <SelectTrigger className="h-8 w-16" aria-label="Jumlah per halaman">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
          variant="outline"
          size="icon-sm"
          aria-label="Halaman sebelumnya"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isLoading || currentPage <= 1}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Button>
        <span className="min-w-16 text-center text-xs text-muted-foreground tabular-nums">
          {currentPage} / {lastPage}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Halaman berikutnya"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLoading || !hasMore}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      </div>
    </div>
  )
}
