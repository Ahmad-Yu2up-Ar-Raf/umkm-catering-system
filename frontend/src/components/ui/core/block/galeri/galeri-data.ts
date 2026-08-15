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

import type { GalleryCategory, GalleryCategoryId } from "./types/gallery-types"

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
  {
    id: "",
    slug: "semua",
    label: "Semua",
    icon: LayoutGridIcon,
    description:
      "Seluruh koleksi momen perayaan, dari pernikahan hingga hampers, dalam satu galeri yang hidup.",
  },
  {
    id: "Pernikahan",
    slug: "pernikahan",
    label: "Pernikahan",
    icon: Diamond01Icon,
    description:
      "Resepsi dan syukuran pernikahan dengan tata saji hangat — hidangan Nusantara yang mempersatukan dua keluarga di hari paling berkesan.",
  },
  {
    id: "Korporat",
    slug: "korporat",
    label: "Korporat",
    icon: Building04Icon,
    description:
      "Prasmanan dan katering profesional untuk gathering, seminar, hingga perayaan perusahaan — rapi, tepat waktu, dan berkelas.",
  },
  {
    id: "Tumpeng & Syukuran",
    slug: "tumpeng-syukuran",
    label: "Syukuran",
    icon: PyramidIcon,
    description:
      "Tumpeng nasi kuning khas untuk momen syukuran — simbol rasa syukur yang disajikan dengan tata krama tradisional yang istimewa.",
  },
  {
    id: "Perayaan",
    slug: "perayaan",
    label: "Perayaan",
    icon: BalloonIcon,
    description:
      "Ulang tahun, arisan, khitanan, hingga perayaan keluarga lainnya — sajian meriah yang membuat setiap momen terasa istimewa.",
  },
  {
    id: "Hampers",
    slug: "hampers",
    label: "Hampers",
    icon: GiftIcon,
    description:
      "Bingkisan istimewa berisi aneka kue dan hidangan pilihan — hadiah yang menyampaikan perhatian dengan penuh cita rasa.",
  },
  {
    id: "Di Balik Dapur",
    slug: "di-balik-dapur",
    label: "Di Balik Dapur",
    icon: CookingPotIcon,
    description:
      "Sekilas dunia dapur kami — ketelatenan menyiapkan hidangan segar, dari meracik bumbu hingga sajian siap dinikmati.",
  },
  {
    id: "Lainnya",
    slug: "lainnya",
    label: "Lainnya",
    icon: SparklesIcon,
    description:
      "Aneka momen di luar kategori — kisah pelanggan dari berbagai penjuru yang merayakan dengan cara mereka sendiri.",
  },
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
      slug: "",
      label: id || "Semua",
      icon: SparklesIcon,
      description: "",
    }
  )
}

/** Category lookup by route slug; returns undefined for unknown slugs. */
export function getCategoryBySlug(slug: string): GalleryCategory | undefined {
  return GALLERY_CATEGORIES.find((c) => c.slug === slug)
}
