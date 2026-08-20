/**
 * Momen Yang Kami Rayakan — presentation view-model for live gallery data.
 *
 * The static dummy set is gone: moments now come from `GET /galeri` via the
 * shared `useGaleriPreviews` fetcher and are mapped through `toMomentItem`.
 * The components render this shape only, so the load path can change without
 * touching the UI.
 */

import type { GalleryItem } from "@/components/ui/core/block/galeri/types/gallery-types"

export interface MomentItem {
  /** Stable id (gallery record id). */
  id: string
  /** Category micro-label, e.g. "Pernikahan" | "Korporat" | "Syukuran". */
  category: string
  /** One-line caption (featured) / two-line max (marquee tiles). */
  title: string
  /** Editorial caption — feeds the fullscreen lightbox, optional. */
  description?: string
  /** Public asset path or Cloudinary URL (API: gambar_acara). */
  imagePath: string
}

export const AUTO_ADVANCE_MS = 6000

/** Normalize a `GalleryItem` into the moment section's presentation shape. */
export function toMomentItem(item: GalleryItem): MomentItem {
  return {
    id: item.id,
    category: item.category,
    title: item.nama_acara,
    description: item.deskripsi_acara,
    imagePath: item.gambar_acara,
  }
}
