"use client"

import { useHeaderOffset } from "../../paket/hooks/use-header-offset"
import type { GalleryCategoryId } from "../types/gallery-types"
import { GalleryCategoryNav } from "./gallery-category-nav"

/**
 * GalleryFilterBar — the sticky category strip. Pins below the global
 * SiteHeader (`useHeaderOffset`) with a hairline border and a warm cream
 * translucent backdrop (same anatomy as the /paket filter bar). Contains the
 * pill nav + a result count ("N momen") on the right — a gallery has no
 * search in v1 (spec §3.3).
 */
export function GalleryFilterBar({
  kategori,
  count,
  onKategoriChange,
}: {
  kategori: GalleryCategoryId
  count: number
  onKategoriChange: (value: GalleryCategoryId) => void
}) {
  const top = useHeaderOffset()

  return (
    <div
      style={{ top }}
      className="sticky z-40 py-2.5 border-b border-border bg-background/90 backdrop-blur-sm"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-nowrap items-center gap-4 px-6">
        <GalleryCategoryNav active={kategori} onSelect={onKategoriChange} />
    
      </div>
    </div>
  )
}
