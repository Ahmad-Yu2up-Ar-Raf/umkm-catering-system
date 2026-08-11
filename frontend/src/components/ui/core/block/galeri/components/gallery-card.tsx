"use client"

import { cn } from "@/lib/utils"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { getCategoryById } from "../galeri-data"
import type { GalleryItem } from "../types/gallery-types"

/** Builds the meta peek parts (venue · date · guests) — honest "—" fallback. */
function metaParts(item: GalleryItem): string[] {
  return [
    item.meta.venue,
    item.meta.tanggal,
    item.meta.jumlahTamu != null ? `${item.meta.jumlahTamu} tamu` : undefined,
  ].filter((part): part is string => Boolean(part))
}

/**
 * GalleryCard — one gallery tile (marquee-card anatomy from `moment-marquee`).
 *
 * - `MediaItem` zoom on hover (`scale-110`, transform-only — compositor-safe).
 * - Warm-brown bottom scrim + category micro-label + Fraunces one-line title.
 * - Meta peek (venue · date · guests) fades in on hover — "—" when unverified.
 * - Top-right `⤢` expand glyph, hover-revealed (decorative; the whole tile is
 *   a real `<button>` so the lightbox trigger is accessible).
 * The whole card opens the lightbox at `index` (position in the visible set).
 */
export function GalleryCard({
  item,
  index,
  onSelect,
  className,
}: {
  item: GalleryItem
  index: number
  onSelect: (index: number) => void
  /** Size/aspect override (rails vs grid). Defaults to the marquee tile. */
  className?: string
}) {
  const category = getCategoryById(item.category)
  const meta = metaParts(item)

  return (
    <button
      type="button"
      aria-label={`Lihat ${item.nama_acara}`}
      onClick={() => onSelect(index)}
      className={cn(
        "group/card relative aspect-[4/3] w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl ring-1 ring-border transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-xl hover:ring-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:w-[260px]",
        className
      )}
    >
      <MediaItem
        webViewLink={item.gambar_acara}
        className="absolute inset-0 h-full w-full object-cover"
        imageClassName="transition-transform duration-[900ms] ease-out group-hover/card:scale-110"
      />

      {/* Scrim — warm brown, caption area only. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-transparent via-foreground/40 to-foreground/90"
      />

      <div className="absolute inset-x-0 bottom-0 p-3.5 text-left">
        <p className="text-[9px] tracking-[0.22em] text-accent uppercase">
          {category.label}
        </p>
        <p className="mt-1 line-clamp-1 text-[12.5px] leading-snug font-light text-background">
          {item.nama_acara}
        </p>
        <p className="mt-1 line-clamp-1 text-[9.5px] tracking-[0.14em] text-background/70 uppercase opacity-0 transition-opacity duration-500 group-hover/card:opacity-100">
          {meta.length > 0 ? meta.join(" · ") : "—"}
        </p>
      </div>

      {/* Expand glyph — decorative (aria-hidden), hover-reveal only. */}
      <span
        aria-hidden="true"
        className="absolute top-2.5 right-2.5 grid size-6 place-items-center rounded-full border border-background/30 bg-foreground/40 text-[11px] text-background/85 opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover/card:opacity-100"
      >
        ⤢
      </span>
    </button>
  )
}
