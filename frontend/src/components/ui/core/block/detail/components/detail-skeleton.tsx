"use client"

import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"

/**
 * 1:1 skeleton for the FINAL structure — one responsive skeleton:
 *
 *  LEFT (sticky gallery on lg)    RIGHT (information rail, top → bottom)
 *  │ main image box               │ identity: badge / title / best-seller
 *  │ thumbnail row (below)        │ price + CTA pill
 *  │                              │ description lines (prominent block)
 *  │                              │ metadata rows (hairline-top)
 *  │                              │ menu: heading + bullet rows
 *  │                              │ facilities: heading + bullet rows
 *
 *  BOTTOM: "Rekomendasi" — 3-card grid skeleton mirroring PaketGrid.
 *
 * Geometry mirrors the real surface so the layout barely shifts on arrival.
 */
export function DetailSkeleton() {
  return (
    <div className="container m-auto w-full px-5 pt-8 pb-24 sm:px-10 md:pt-15 md:pb-32">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        {/* LEFT — gallery */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl lg:aspect-[16/15]" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton
                key={i}
                className="aspect-[4/3] h-16 rounded-lg md:h-20"
              />
            ))}
          </div>
        </div>

        {/* RIGHT — sequential information rail */}
        <div className="flex flex-col gap-6 lg:gap-7 lg:py-2">
          {/* identity */}
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>

          {/* price + CTA */}
          <div className="flex flex-col gap-5">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-12 w-full rounded-[100px]" />
          </div>

          {/* description — prominent block */}
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-4/6" />
          </div>

          {/* metadata rows */}
          <div className="flex flex-col gap-3 border-t border-border pt-5">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="flex items-baseline justify-between gap-6">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-3 w-32 rounded-full" />
              </div>
            ))}
          </div>

          {/* menu section */}
          <div className="flex flex-col gap-2 border-t border-border pt-6">
            <Skeleton className="h-3 w-36 rounded-full" />
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-4 w-4/6" />
            ))}
          </div>

          {/* facilities section */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-40 rounded-full" />
            {Array.from({ length: 2 }, (_, i) => (
              <Skeleton key={i} className="h-4 w-5/6" />
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM — recommendations grid (mirrors PaketGrid grid-3) */}
      <div className="mt-24 flex flex-col gap-10 md:mt-28">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="min-h-[16em] w-full rounded-2xl md:min-h-[20em]" />
              <div className="flex flex-col gap-3 py-2">
                <Skeleton className="h-6 w-1/3 rounded-full" />
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="pt-4">
                  <Skeleton className="h-6 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
