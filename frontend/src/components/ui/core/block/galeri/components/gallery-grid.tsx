"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import type { GalleryItem } from "../types/gallery-types"
import { GalleryCard } from "./gallery-card"

/**
 * GalleryGrid — the single-category view: a responsive grid with structural
 * variety (anti 3-equal-card, spec §3.3): the first tile spans 2 columns on
 * lg, then tiles alternate `aspect-[4/3]` and `aspect-[3/4]`. States: skeleton
 * tiles while loading, honest error panel with retry, and an empty state when
 * a filter matches nothing.
 */
export function GalleryGrid({
  items,
  isLoading,
  isError,
  onRetry,
  onReset,
  onSelect,
}: {
  items: GalleryItem[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onReset?: () => void
  onSelect: (index: number) => void
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="aspect-[4/3] w-full rounded-2xl lg:col-span-2" />
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "aspect-[4/3] w-full rounded-2xl",
              i % 3 === 1 && "aspect-[3/4]"
            )}
          />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-base text-muted-foreground">
          Momen tidak dapat dimuat saat ini.
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Muat ulang
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-base text-muted-foreground">
          Belum ada momen untuk kategori ini.
        </p>
        {onReset && (
          <Button variant="outline" size="sm" onClick={onReset}>
            Lihat semua momen
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <GalleryCard
          key={item.id}
          item={item}
          index={index}
          onSelect={onSelect}
          className={cn(
            "w-full",
            index === 0 && "lg:col-span-2",
            index === 0 ? "aspect-[4/3]" : index % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/3]"
          )}
        />
      ))}
    </div>
  )
}
