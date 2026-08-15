"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { motion } from "framer-motion"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

import type { GalleryItem } from "../types/gallery-types"
import { GalleryCard } from "./gallery-card"

/** Responsive column count — 1 / 2 / 3, driven by Tailwind breakpoints. */
function useColumnCount() {
  const [cols, setCols] = useState(1)

  useEffect(() => {
    const mqs = [
      window.matchMedia("(min-width: 640px)"),
      window.matchMedia("(min-width: 1024px)"),
    ]
    const update = () =>
      setCols(mqs[1].matches ? 3 : mqs[0].matches ? 2 : 1)
    update()
    mqs.forEach((m) => m.addEventListener("change", update))
    return () => mqs.forEach((m) => m.removeEventListener("change", update))
  }, [])

  return cols
}

/**
 * Aspect ledger — deterministic per-item visual pin. A coprime stride
 * (`index × 3 mod len`) drifts adjacent columns out of phase; the `h` weight
 * (relative height for its width) drives greedy shortest-column placement, so
 * a 2/3 portrait costs more column height than a 16/10 landscape.
 */
const RATIOS = [
  { cls: "aspect-[2/3]", h: 1.5, skelH: "h-64 md:h-72" },
  { cls: "aspect-[3/4]", h: 4 / 3, skelH: "h-52 md:h-60" },
  { cls: "aspect-[4/5]", h: 5 / 4, skelH: "h-48 md:h-56" },
  { cls: "aspect-square", h: 1, skelH: "h-44 md:h-52" },
  { cls: "aspect-[4/5]", h: 5 / 4, skelH: "h-48 md:h-56" },
  { cls: "aspect-[3/4]", h: 4 / 3, skelH: "h-52 md:h-60" },
  { cls: "aspect-[16/10]", h: 10 / 16, skelH: "h-36 md:h-44" },
] as const

const RATIO_COUNT = RATIOS.length

/** Deterministic per-item aspect — a pure function of its index. */
function ratioFor(index: number) {
  return RATIOS[(index * 3) % RATIO_COUNT]
}

/**
 * TRUE Pinterest-style masonry placement — GREEDY SHORTEST-COLUMN.
 *
 * Items are consumed in API order and placed into whichever column is
 * currently SHORTEST (weighted by the item's aspect `h`). Because this is a
 * STREAMING decision — item i's column depends only on items 0…i−1 — a new
 * page's items are simply appended into the growing columns and NO already-
 * placed item ever moves. The mapping is deterministic for any ordered list,
 * and the result is naturally JAGGED: columns end at different heights and
 * rows never align (unlike `index % cols`, which balances by count and reads
 * as a rigid grid).
 *
 * This is NOT CSS multi-columns (the browser never reflows column heights)
 * and NOT a synchronized CSS grid — each column is an independent vertical
 * flex stack.
 */
function placeColumns<T>(
  items: T[],
  cols: number,
  heightOf: (index: number) => number
): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => [])
  const heights = new Array<number>(cols).fill(0)

  items.forEach((item, index) => {
    // Shortest column; ties fall to the leftmost for determinism.
    let target = 0
    for (let c = 1; c < cols; c++) {
      if (heights[c] < heights[target] - 1e-9) target = c
    }
    columns[target].push(item)
    heights[target] += heightOf(index)
  })

  return columns
}

/** Item reveal — opacity + lift (no blur: cheap and calm at scale). */
function useItemReveal() {
  const reduced = useReducedMotion()
  const easing = reduced
    ? undefined
    : ([0.16, 1, 0.3, 1] as [number, number, number, number])
  return { reduced, transition: { duration: reduced ? 0 : 0.5, ease: easing } }
}

/**
 * GalleryGrid — TRUE Pinterest-style masonry for a category page.
 *
 * Layout: greedy shortest-column FLEX COLUMNS (NOT CSS multi-columns, NOT a
 * grid). Each column is an independent vertical stack, so columns end jagged
 * and rows never align. `placeColumns` is deterministic and streaming:
 * infinite-scroll appends extend existing columns in place and never move
 * already-rendered cards.
 *
 * Vertical INFINITE SCROLL: a sentinel below the columns auto-fetches the
 * next page via IntersectionObserver (400px pre-load margin — same mechanics
 * as PaketGrid). Error/empty states are honest and actionable.
 */
export function GalleryGrid({
  items,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onRetry,
  onReset,
}: {
  items: GalleryItem[]
  isLoading: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  onRetry: () => void
  onReset?: () => void
}) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const cols = useColumnCount()
  const { reduced, transition: reveal } = useItemReveal()

  // Greedy, streaming placement — deterministic weights are a PURE function
  // of the item's index, so item i lands in the same column regardless of how
  // many items come after it. Appending page N therefore NEVER reshuffles
  // items 0…N−1; new items simply extend their assigned columns.
  const columns = useMemo(
    () => placeColumns(items, cols, (i) => ratioFor(i).h),
    [items, cols]
  )

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

  /** Renders one column as a list of nodes (cards). */
  const renderColumnNodes = (nodes: React.ReactNode[]) => (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      {nodes}
    </div>
  )

  // Skeletons for the NEXT page, placed INSIDE each column right after the
  // real cards — so the loading batch is a natural continuation of the
  // masonry the user is looking at (never an offscreen block after it).
  // Fixed `skelH` heights (not aspect-derived) guarantee they render visibly,
  // and the greedy distribution over the upcoming index window mirrors where
  // the incoming cards will actually land.
  const skeletonRow = useMemo(() => {
    if (!isFetchingNextPage || !hasNextPage) return null
    const start = items.length
    const window = Array.from({ length: 9 }, (_, i) => start + i)
    return placeColumns(window, cols, (i) => ratioFor(i).h)
  }, [isFetchingNextPage, hasNextPage, items.length, cols])

  return (
    <div className="flex flex-col gap-8">
      {isError ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="font-heading text-xl">Gagal memuat momen</p>
          <Button variant="outline" onClick={onRetry}>
            Muat ulang
          </Button>
        </div>
      ) : isLoading ? (
        // Skeleton mirrors the greedy-placement footprint for its column.
        <div className="flex items-start gap-4">
          {placeColumns(
            Array.from({ length: 9 }, (_, i) => i),
            cols,
            (i) => ratioFor(i).h
          ).map((col) =>
            renderColumnNodes(
              col.map((i) => (
                <Skeleton
                  key={i}
                  className={cn(
                    "w-full min-h-[10rem] rounded-2xl",
                    ratioFor(i + 3).cls
                  )}
                />
              ))
            )
          )}
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
          <div className="flex items-start gap-4">
            {columns.map((col, columnIndex) =>
              renderColumnNodes(
                col.map((item) => {
                  const index = items.indexOf(item)
                  return (
                    <motion.div
                      key={item.id}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.05 }}
                      transition={reveal}
                      className="will-change-transform"
                    >
                      <GalleryCard
                        item={item}
                        index={index}
                        scope={items}
                        className={cn(
                          "w-full rounded-2xl",
                          ratioFor(index).cls
                        )}
                      />
                    </motion.div>
                  )
                })
                // Next-page skeletons appended INSIDE this column, in flow.
                // `key` includes the window start so each fetch batch gets a
                // fresh, stable skeleton identity (no reuse across pages).
                .concat(
                  skeletonRow && skeletonRow[columnIndex]
                    ? skeletonRow[columnIndex].map((idx) => (
                        <Skeleton
                          key={`sk-${idx}`}
                          className={cn(
                            "w-full animate-pulse rounded-2xl",
                            ratioFor(idx + 3).skelH
                          )}
                        />
                      ))
                    : []
                )
              )
            )}
          </div>
          {hasNextPage && (
            <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
          )}
        </>
      )}
    </div>
  )
}