"use client"

import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/fragments/shadcn-ui/tooltip"
import { useImageModalStore } from "@/store/image-modal-store"
import { getCategoryById } from "../galeri-data"
import type { GalleryItem } from "../types/gallery-types"

/** Tooltip copy — location · guest count, honest "—" fallback. */
function metaText(item: GalleryItem): string {
  const parts = [
    item.meta.venue,
    item.meta.jumlahTamu != null ? `${item.meta.jumlahTamu} tamu` : undefined,
  ].filter((part): part is string => Boolean(part))
  return parts.length > 0 ? parts.join(" · ") : "Keterangan belum tersedia"
}

/**
 * GalleryCard — one gallery tile. CLEAN by default: category eyebrow + title
 * only. Location + guest count live in a Shadcn `Tooltip` triggered on hover.
 *
 * In the masonry grid the card's height comes from `aspectRatio` (the image's
 * MEASURED natural ratio) → the tile matches its real proportion, so columns
 * flow independently at natural heights. The carousel rails pass their own
 * `className="aspect-[16/10]"` instead (uniform preview peeks). The card has
 * NO baked-in aspect ratio itself — that baked box (`aspect-[4/3]` +
 * `lg:h-[min(9em,520px)]`, from the earlier version) is exactly what made
 * every image look like the same-size grid thumbnail.
 */
export function GalleryCard({
  item,
  index,
  scope,
  className,
  aspectRatio,
  onImageLoaded,
}: {
  item: GalleryItem
  index: number
  /** Lightbox navigation scope (the visible set the user clicked from). */
  scope: GalleryItem[]
  /** Size/aspect override from the parent (rails vs masonry grid). */
  className?: string
  /** Measured natural ratio (w/h) — sizes the card to the real image. */
  aspectRatio?: number
  /** Reports the image's natural dimensions back to the masonry layout. */
  onImageLoaded?: (id: string, width: number, height: number) => void
}) {
  const category = getCategoryById(item.category)
  const ratioStyle =
    aspectRatio && aspectRatio > 0
      ? ({ aspectRatio: `${aspectRatio}` } as CSSProperties)
      : undefined

  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Lihat ${item.nama_acara}`}
            onClick={() =>
              useImageModalStore.getState().open(
                scope.map((i) => ({
                  src: i.gambar_acara,
                  title: i.nama_acara,
                  caption: i.deskripsi_acara,
                  category: getCategoryById(i.category).label,
                })),
                index
              )
            }
            style={ratioStyle}
            className={cn(
              "group/card relative block w-full overflow-hidden rounded-2xl ring-1 ring-border transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-xl hover:ring-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aspect-[4/3]",
              className
            )}
          >
            <MediaItem
              webViewLink={item.gambar_acara}
              className="absolute inset-0 h-full w-full"
              imageClassName="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover/card:scale-110"
              onImageLoaded={(w, h) => onImageLoaded?.(item.id, w, h)}
            />

            {/* Scrim — warm brown, caption area only. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-foreground/40 to-foreground/90"
            />

            {/* Clean caption — eyebrow + title only. */}
            <div className="absolute inset-x-0 bottom-0 p-3.5 text-left">
              <p className="text-[9.5px] tracking-[0.22em] text-accent uppercase">
                {category.label}
              </p>
              <p className="mt-1 line-clamp-1 text-sm leading-snug font-light text-background">
                {item.nama_acara}
              </p>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={4}>
          <span>{metaText(item)}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
