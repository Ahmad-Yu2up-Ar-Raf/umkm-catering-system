"use client"

import { useEffect, useRef, useState } from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

import type { Paket } from "../types/paket-types"
import { PaketCard } from "./paket-card"
import { CatalogLayoutToggle, type LayoutMode } from "./catalog-layout-toggle"

const SKELETON_COUNT = 6

/** Stagger between product cards on a fresh-filter reveal (index × 50ms). */
const STAGGER_S = 0.05

/**
 * PaketGrid — responsive card grid (1 → 2 → 3 cols, per `catalog.md`) with
 * the loading / empty / error / infinite-scroll states. Skeletons only appear
 * when there is NO cached data at all; a filter change keeps the previous
 * pages visible and dimmed (`isPlaceholderData` → `opacity-60`) instead of
 * flashing skeletons. Auto-loads the next page when a sentinel below the grid
 * enters the viewport (native IntersectionObserver, 400px pre-load margin).
 *
 * Entry reveal: cards fade + rise in a 50ms stagger — but ONLY on the initial
 * load and when fresh data lands for a changed filter (`isPlaceholderData`
 * flipping true→false). Infinite-scroll appends never re-stagger, so the page
 * stays smooth at the bottom.
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
  layoutMode = "horizontal",
  onLayoutModeChange,
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
  layoutMode: LayoutMode
  onLayoutModeChange: (mode: LayoutMode) => void
  onLoadMore: () => void
  onRetry: () => void
  onReset: () => void
}) {
  const isFiltered = Boolean(kategori || search)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  // Re-run the entry stagger ONLY when fresh data lands for a changed filter
  // (placeholder → real). Uses React's sanctioned "adjust state during render"
  // pattern — no ref reads during render, no setState in effects.
  const [prevPlaceholder, setPrevPlaceholder] = useState(isPlaceholderData)
  const [revealKey, setRevealKey] = useState(0)
  if (prevPlaceholder !== isPlaceholderData) {
    setPrevPlaceholder(isPlaceholderData)
    if (!isPlaceholderData) setRevealKey((k) => k + 1)
  }

  // Sentinel → next page. Re-arms when a fetch finishes (the guard reads the
  // fresh `isFetchingNextPage`), so scrolling chains pages until `hasNextPage`
  // runs out.
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

  const cardVariants = {
    hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : 0.4, ease: "easeOut" },
    },
  } as const

  const gridContainerClass = cn(
    layoutMode === "horizontal" && "flex flex-col gap-8",
    layoutMode === "grid-2" && "grid grid-cols-1 gap-15 md:grid-cols-2",
    layoutMode === "grid-3" &&
      "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
  )

  /** Skeleton grouped to mirror the exact footprint of the active layout mode. */
  const PaketSkeleton = () => (
    <div
      className={cn(
        "animate-pulse",
        layoutMode === "horizontal" &&
          "flex w-full flex-col gap-6 md:flex-row md:items-stretch md:gap-8"
      )}
    >
      {/* <Skeleton
        className={cn(
          "w-full rounded-2xl",
          layoutMode === "horizontal"
            ? "aspect-[16/10] md:aspect-[16/13] md:h-full md:w-[40%] md:max-w-sm xl:w-[35%]"
            : "min-h-[16em] md:min-h-[20em]"
        )}
      /> */}
      <div
        className={cn(
          "flex flex-1 flex-col gap-3",
          layoutMode === "horizontal" ? "justify-center py-2" : "py-2"
        )}
      >
        <Skeleton className="h-6 w-1/3 rounded-full" />
        <Skeleton className="h-7 w-3/4" />
        {layoutMode !== "grid-3" && (
          <>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </>
        )}
        <div className="pt-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        {isLoading ? (
          <Skeleton className="h-6 w-24 rounded-md" />
        ) : (
          total > 0 && (
            <p className="text-xs tracking-widest text-muted-foreground uppercase">
              {total} paket
            </p>
          )
        )}
        <CatalogLayoutToggle current={layoutMode} onChange={onLayoutModeChange} />
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="font-heading text-xl">Gagal memuat katalog</p>
          <Button variant="outline" onClick={onRetry}>
            Coba lagi
          </Button>
        </div>
      ) : isLoading ? (
        <div className={gridContainerClass}>
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <PaketSkeleton key={i} />
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
          <motion.div
            key={`${revealKey}-${layoutMode}`}
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: reduced ? 0 : STAGGER_S },
              },
            }}
            className={gridContainerClass}
          >
            {pakets.map((paket) => (
              <motion.div key={paket.id} variants={cardVariants}>
                <PaketCard
                  paket={paket}
                  layoutMode={layoutMode}
                  className={cn(isPlaceholderData && "opacity-60")}
                />
              </motion.div>
            ))}
          </motion.div>
          {hasNextPage && (
            <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
          )}
          {isFetchingNextPage && (
            <div className="flex min-h-[150px] w-full items-center justify-center py-6">
              <Spinner className="size-5 text-muted-foreground lg:size-10" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
