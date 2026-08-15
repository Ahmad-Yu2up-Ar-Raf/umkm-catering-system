"use client"

import { GalleryCategoryNav } from "./gallery-category-nav"

/**
 * GalleryFilterBar — the sticky category strip for `/galeri/:kategori` and
 * `/galeri/semua`.
 *
 * Native `position: sticky; top: 0`: the bar participates in document flow
 * and becomes pinned ONLY once it physically reaches the viewport top —
 * no JS offset, no scroll listeners. On these routes the SiteHeader is
 * in-flow (it scrolls away), so pinning at `top-0` never overlaps the nav.
 */
export function GalleryFilterBar({
  activeSlug,
  onSelect,
}: {
  activeSlug: string
  onSelect: (slug: string) => void
}) {
  return (
    <div className="sticky top-0 z-40 py-2.5 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto justify-between flex w-full max-w-5xl flex-nowrap items-center gap-4 px-6">
        <GalleryCategoryNav activeSlug={activeSlug} onSelect={onSelect} />
      </div>
    </div>
  )
}
