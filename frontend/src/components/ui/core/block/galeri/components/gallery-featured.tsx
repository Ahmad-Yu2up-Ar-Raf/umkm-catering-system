"use client"

import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { Card } from "@/components/ui/fragments/shadcn-ui/card"
import { useImageModalStore } from "@/store/image-modal-store"
import { getCategoryById } from "../galeri-data"
import type { GalleryItem } from "../types/gallery-types"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"

/** Luxury ease — premium Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/** Slide blend window (s) — a calm, premium cross-fade with a subtle blur. */
const CROSSFADE = 0.7

/** Builds the meta strip parts (venue · date · guests) — honest "—" fallback. */
function metaParts(item: GalleryItem): string[] {
  return [
    item.meta.venue,
    item.meta.tanggal,
    item.meta.jumlahTamu != null ? `${item.meta.jumlahTamu} tamu` : undefined,
  ].filter((part): part is string => Boolean(part))
}

/**
 * GalleryFeatured — the signature crossfade display (adapts MomentFeatured).
 *
 * Framer `AnimatePresence mode="wait"`: each slide exits fully before the
 * next enters (keyed by item), so rapid clicking can never stack/linger
 * frames or race a shared timeline. The blend is an ultra-smooth
 * CROSS-FADE + subtle BLUR (opacity 0→1 with a soft 6px blur settle) — no
 * scale zoom, no bounce. `MotionConfig reducedMotion="user"` (block root)
 * renders this instantly.
 *
 * Base = Shadcn `Card` flattened to a media surface; the parent constrains
 * the width (container boundary) while the image fills the card exactly
 * (`w-full h-full object-cover`).
 */
export function GalleryFeatured({
  items,
  activeIndex,
  onSelect,
}: {
  items: GalleryItem[]
  activeIndex: number
  onSelect: (index: number) => void
}) {
  const active = items[activeIndex]
  const category = getCategoryById(active.category)
  const meta = metaParts(active)

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-border bg-transparent p-0 shadow-none dark:bg-transparent">
      <div className="relative aspect-[3/2] w-full overflow-hidden sm:aspect-[2/1] lg:aspect-auto lg:h-[min(60vh,520px)]">
        {/* Keyed slide — the ONLY frame rendered; exit completes before enter
            (mode="wait"), so overlaps and stuck states are impossible. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.id}
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: CROSSFADE, ease: LUXURY_EASE }}
            className="absolute inset-0"
          >
            <MediaItem
              webViewLink={active.gambar_acara}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Readability scrim — warm brown, limited to the lower half. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-foreground/20 to-foreground/85"
        />

        {/* Category Badge — top-left. */}
        <div className="absolute top-4 left-4 z-10 sm:top-6 sm:left-6">
          <Badge
            variant="outline"
            size="sm"
            className="border-background/30 bg-foreground/40 text-[10px] tracking-[0.2em] text-background uppercase backdrop-blur-sm"
          >
            {category.label}
          </Badge>
        </div>

        {/* Expand trigger — top-right, opens the global image modal. */}
        <Button
          type="button"
          aria-label={`Lihat ${active.nama_acara}`}
          onClick={() =>
            useImageModalStore.getState().open(
              items.map((i) => ({
                src: i.gambar_acara,
                title: i.nama_acara,
                caption: i.deskripsi_acara,
                category: getCategoryById(i.category).label,
              })),
              activeIndex
            )
          }
          size={"icon-sm"}
          className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full border border-background/30 bg-foreground/40 text-lg text-background/90 backdrop-blur-sm transition-colors duration-300 hover:bg-foreground/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:top-6 sm:right-6"
        >
          <span aria-hidden="true" className="translate-y-[-1px]">
            ⤢
          </span>
          <span className="sr-only">Perbesar</span>
        </Button>

        {/* Caption + meta + pagination pills. */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 text-left sm:p-9 md:pb-8">
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.3em] text-accent uppercase">
              {category.label}
            </p>
            <p className="mt-2 max-w-[560px] font-heading text-[clamp(20px,3vw,36px)] leading-tight font-light text-background">
              {active.nama_acara}
            </p>
            <p className="mt-2 text-[11px] tracking-[0.08em] text-background/85 uppercase">
              {meta.length > 0 ? meta.join(" · ") : "—"}
            </p>
          </div>

          {/* Pagination pills — hidden on mobile, clickable to jump. */}
          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Lihat ${item.nama_acara}`}
                aria-current={index === activeIndex}
                onClick={() => onSelect(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  index === activeIndex
                    ? "w-8 bg-accent"
                    : "w-1.5 bg-background/30 hover:bg-background/60"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
