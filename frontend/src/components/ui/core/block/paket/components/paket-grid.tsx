"use client"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import { cn } from "@/lib/utils"

import type { Paket } from "../types/paket-types"
import { PaketCard } from "./paket-card"

const SKELETON_COUNT = 6

/**
 * PaketGrid — responsive card grid (1 → 2 → 3 cols, per `catalog.md`) with
 * the loading / empty / error / load-more states. Skeletons only appear when
 * there is NO cached data at all; a filter change keeps the previous pages
 * visible and dimmed (`isPlaceholderData` → `opacity-60`) instead of flashing
 * skeletons. Load-more is an explicit button — no auto-infinite scroll.
 */
export function PaketGrid({
  pakets,
  total,
  isLoading,
  isPlaceholderData,
  isError,
  hasNextPage,
  isFetchingNextPage,
  kategori,
  search,
  onLoadMore,
  onRetry,
  onReset,
}: {
  pakets: Paket[]
  total: number
  isLoading: boolean
  isPlaceholderData: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  kategori: string
  search: string
  onLoadMore: () => void
  onRetry: () => void
  onReset: () => void
}) {
  const isFiltered = Boolean(kategori || search)

  return (
    <div className="flex flex-col gap-8">
      {total > 0 && !isLoading && (
        <p className="text-xs tracking-widest text-muted-foreground uppercase">
          {total} paket
        </p>
      )}

      {isError ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="font-heading text-xl">Gagal memuat katalog</p>
          <Button variant="outline" onClick={onRetry}>
            Coba lagi
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-card p-0 shadow-sm"
            >
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : pakets.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="font-heading text-xl">Tidak ada paket yang cocok</p>
          {isFiltered && (
            <>
              <p className="max-w-md text-sm text-muted-foreground">
                Tidak ada hasil untuk{" "}
                <span className="font-medium text-foreground">
                  {[kategori, search].filter(Boolean).join(" · ")}
                </span>
                .
              </p>
              <Button variant="outline" onClick={onReset}>
                Reset filter
              </Button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pakets.map((paket) => (
              <PaketCard
                key={paket.id}
                paket={paket}
                className={cn(isPlaceholderData && "opacity-60")}
              />
            ))}
          </div>
          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Memuat…" : "Muat lebih banyak"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
