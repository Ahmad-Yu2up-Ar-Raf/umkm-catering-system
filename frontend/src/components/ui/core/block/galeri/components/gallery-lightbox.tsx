"use client"

import { useCallback, useEffect } from "react"

import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/fragments/shadcn-ui/dialog"
import { getCategoryById } from "../galeri-data"
import type { GalleryItem } from "../types/gallery-types"

/** Builds the meta strip parts (venue · date · guests) — honest "—" fallback. */
function metaParts(item: GalleryItem): string[] {
  return [
    item.meta.venue,
    item.meta.tanggal,
    item.meta.jumlahTamu != null ? `${item.meta.jumlahTamu} tamu` : undefined,
  ].filter((part): part is string => Boolean(part))
}

/**
 * GalleryLightbox — full-screen media viewer over the shadcn Radix Dialog
 * (focus trap, ESC close, scroll-lock built in — spec §3.3).
 *
 * - Full-bleed `object-contain` media (never cropped in the viewer).
 * - Footer bar: event name (Fraunces) · category Badge · meta strip ·
 *   position ("3 / 18").
 * - Prev/Next round buttons + ArrowLeft/ArrowRight keys wrap around the
 *   current `items` scope (the visible set the user clicked from).
 * - `open` is fully controlled by the parent; closing (button / ESC / overlay)
 *   calls `onClose`.
 */
export function GalleryLightbox({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: GalleryItem[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}) {
  const isOpen = items.length > 0 && index >= 0 && index < items.length
  const item = isOpen ? items[index] : undefined

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!isOpen) return
      onIndexChange((index + dir + items.length) % items.length)
    },
    [isOpen, index, items.length, onIndexChange]
  )

  // Keyboard: ArrowLeft / ArrowRight (ESC handled natively by Radix).
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault()
        step(1)
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        step(-1)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, step])

  if (!isOpen || !item) return null

  const category = getCategoryById(item.category)
  const meta = metaParts(item)

  return (
    <Dialog
      open
      onOpenChange={(openState) => {
        if (!openState) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex h-dvh w-screen max-w-none flex-col gap-0 rounded-none border-0 bg-popover p-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">{item.nama_acara}</DialogTitle>
        <DialogDescription className="sr-only">
          {item.deskripsi_acara ?? category.label}
        </DialogDescription>

        {/* Media area — full-bleed, never cropped. */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
          <MediaItem
            webViewLink={item.gambar_acara}
            className="h-full w-full"
            imageClassName="object-contain"
          />

          {/* Prev / Next — centered on the media area. */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sebelumnya"
            onClick={() => step(-1)}
            className="absolute top-1/2 left-3 z-10 size-11 -translate-y-1/2 rounded-full border border-border bg-popover/90 backdrop-blur-sm hover:bg-muted"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Berikutnya"
            onClick={() => step(1)}
            className="absolute top-1/2 right-3 z-10 size-11 -translate-y-1/2 rounded-full border border-border bg-popover/90 backdrop-blur-sm hover:bg-muted"
          >
            <HugeiconsIcon icon={ArrowRight02Icon} className="size-5" />
          </Button>

          {/* Close — top-right. */}
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Tutup"
              className="absolute top-3 right-3 z-10 size-11 rounded-full border border-border bg-popover/90 backdrop-blur-sm hover:bg-muted"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
            </Button>
          </DialogClose>
        </div>

        {/* Footer bar — caption + category + meta + position. */}
        <div className="flex items-center justify-between gap-4 border-t border-border bg-popover px-5 py-4 sm:px-8">
          <div className="min-w-0">
            <p className="line-clamp-1 font-heading text-base leading-snug font-light tracking-tight text-foreground">
              {item.nama_acara}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                size="sm"
                className="text-[9px] tracking-[0.18em] uppercase"
              >
                {category.label}
              </Badge>
              {meta.length > 0 && (
                <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                  {meta.join(" · ")}
                </p>
              )}
            </div>
          </div>
          <p className="shrink-0 text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            {index + 1} / {items.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
