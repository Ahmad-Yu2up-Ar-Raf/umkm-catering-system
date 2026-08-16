"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Restaurant01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { PaketImagesCarousel } from "./paket-images-carousel"

interface DetailGalleryProps {
  gallery: string[]
  /** Accessible image label (the package name). */
  alt: string
  modalTitle: string
  modalCategory?: string
  className?: string
}

/**
 * DetailGallery — the package's media surface; sticky on desktop (CSS-native,
 * NO measured JS offset). When the package has no usable photos it renders an
 * honest branded EMPTY state — never another package's/category's photo.
 */
export function DetailGallery({
  gallery,
  alt,
  modalTitle,
  modalCategory,
  className,
}: DetailGalleryProps) {
  if (gallery.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl bg-muted/50   text-center r",
          className
        )}
      >
        <HugeiconsIcon
          icon={Restaurant01Icon}
          className="size-9 text-foreground/35"
        />
        <p className="font-heading text-xl font-light text-foreground">
          {modalTitle}
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Foto paket ini segera hadir. Konsultasikan pilihan menu via WhatsApp.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("lg:sticky lg:top-9 lg:self-start", className)}>
      <PaketImagesCarousel
        gallery={gallery}
        alt={alt}
        modalTitle={modalTitle}
        modalCategory={modalCategory}
      />
    </div>
  )
}
