import {
  BalloonIcon,
  Building04Icon,
  CookingPotIcon,
  Diamond01Icon,
  GiftIcon,
  LayoutGridIcon,
  PyramidIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

import type {
  GalleryCategory,
  GalleryCategoryId,
} from "./types/gallery-types"

/**
 * Galeri Perayaan — category catalog + shared helpers.
 *
 * Gallery ENTRIES now come from the backend `GET /api/v1/galeri`
 * (via `useGaleriQuery`); this module only owns the CATEGORY set (mirrors
 * `GaleriKategoriEnum`) and pure helpers. Icons verified against
 * `@hugeicons/core-free-icons` v4.2.3.
 */

export const AUTO_ADVANCE_MS = 6000

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  { id: "", label: "Semua", icon: LayoutGridIcon, description: "Semua momen perayaan" },
  { id: "Pernikahan", label: "Pernikahan", icon: Diamond01Icon, description: "Resepsi yang anggun dan hangat" },
  { id: "Korporat", label: "Korporat", icon: Building04Icon, description: "Gathering dan acara kantor" },
  { id: "Tumpeng & Syukuran", label: "Tumpeng & Syukuran", icon: PyramidIcon, description: "Tumpeng untuk syukuran" },
  { id: "Perayaan", label: "Perayaan", icon: BalloonIcon, description: "Ulang tahun, arisan, dan lainnya" },
  { id: "Hampers", label: "Hampers", icon: GiftIcon, description: "Bingkisan istimewa" },
  { id: "Di Balik Dapur", label: "Di Balik Dapur", icon: CookingPotIcon, description: "Ketelatenan di dapur" },
  { id: "Lainnya", label: "Lainnya", icon: SparklesIcon, description: "Momen lainnya" },
]

/**
 * Category lookup by value. Unknown (future enum) values fall back to a
 * defensive entry whose label IS the raw value — the UI never shows "Semua"
 * on a card just because the backend grew a category.
 */
export function getCategoryById(id: string): GalleryCategory {
  return (
    GALLERY_CATEGORIES.find((c) => c.id === id) ?? {
      id: id as GalleryCategoryId,
      label: id || "Semua",
      icon: SparklesIcon,
      description: "",
    }
  )
}
