"use client"

import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"

/**
 * 1:1 skeleton — mirrors the real page geometry exactly (same grid, same
 * aspect boxes), so the layout barely shifts when content arrives. One
 * responsive skeleton: desktop shows the thumb rail, mobile the dots.
 */
export function DetailSkeleton() {
  return (
    <div className="container m-auto w-full px-5 pt-8 pb-24 sm:px-10 md:pt-12 md:pb-32">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        {/* gallery */}
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          {/* mobile dots */}
          <div className="flex items-center justify-center gap-1.5 lg:hidden">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="size-2.5 rounded-full" />
            ))}
          </div>
          {/* desktop rail + main */}
          <div className="hidden items-stretch gap-3 lg:flex">
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-[3/4] w-16 rounded-lg"
                />
              ))}
            </div>
            <Skeleton className="h-[26rem] min-w-0 flex-1 rounded-xl" />
          </div>
        </div>

        {/* summary rail */}
        <div className="flex flex-col gap-5 lg:pt-2">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-10 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
          <Skeleton className="h-11 w-56" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-[100px]" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>

      {/* below-the-fold sections */}
      <div className="mt-16 flex flex-col gap-10">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-24 w-full max-w-3xl rounded-xl" />
        <Skeleton className="h-20 w-full max-w-3xl rounded-xl" />
      </div>
    </div>
  )
}
