"use client"

import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
import { cn } from "@/lib/utils"

import type { GalleryItem } from "../types/gallery-types"
import { GalleryCard } from "./gallery-card"

/** Deterministic waterfall variety — cycles so columns look staggered. */
const ASPECTS = [
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[4/3]",
  "aspect-[16/10]",
  "aspect-[4/5]",
  "aspect-[3/4]",
] as const

/**
 * GalleryGrid — Pinterest-style masonry for a filtered category, driven by
 * CSS multi-columns (`break-inside-avoid` — zero JS, cards keep natural
 * column flow). Cards carry a cycling aspect ratio for the waterfall rhythm.
 *
 * Vertical INFINITE SCROLL: a sentinel below the columns auto-fetches the
 * next page via IntersectionObserver (400px pre-load margin — same mechanics
 * as PaketGrid). Skeletons mirror the masonry footprint; error/empty states
 * are honest and actionable.
 */
export function GalleryGrid({
  items,
  total,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onRetry,
  onReset,
}: {
  items: GalleryItem[]
  total: number
  isLoading: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  onRetry: () => void
  onReset?: () => void
}) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Sentinel → next page. Re-arms when a fetch finishes (the guard reads the
  // fresh `isFetchingNextPage`), so scrolling chains pages until `hasNextPage`.
  useEffect(() => {
    if (!hasNextPage) return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) onLoadMore()
      },
      { root: null, rootMargin: "400px", threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, onLoadMore])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        {isLoading ? (
          <Skeleton className="h-6 w-24 rounded-full" />
        ) : (
          total > 0 && (
            <p className="text-xs tracking-widest text-muted-foreground uppercase">
              {total} momen
            </p>
          )
        )}
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="font-heading text-xl">Gagal memuat momen</p>
          <Button variant="outline" onClick={onRetry}>
            Muat ulang
          </Button>
        </div>
      ) : isLoading ? (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton
              key={i}
              className={cn(
                "mb-4 w-full break-inside-avoid rounded-2xl",
                ASPECTS[i % ASPECTS.length]
              )}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="font-heading text-xl">
            Belum ada momen untuk kategori ini
          </p>
          {onReset && (
            <Button variant="outline" onClick={onReset}>
              Lihat semua momen
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {items.map((item, index) => (
              <GalleryCard
                key={item.id}
                item={item}
                index={index}
                scope={items}
                className={cn(
                  "mb-4 w-full break-inside-avoid rounded-2xl",
                  ASPECTS[index % ASPECTS.length]
                )}
              />
            ))}
          </div>
          {hasNextPage && (
            <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
          )}
          {isFetchingNextPage && (
            <div className="flex min-h-[120px] w-full items-center justify-center py-6">
              <Spinner className="size-5 text-muted-foreground" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
