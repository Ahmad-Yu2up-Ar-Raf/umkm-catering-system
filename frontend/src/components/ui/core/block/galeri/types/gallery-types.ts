import type { IconSvgElement } from "@hugeicons/react"

/**
 * URL value for `?kategori=` — "" = "Semua" (param omitted). Matches the
 * category set in `galeri-data.ts`, NOT the backend `KategoriAcaraEnum`
 * (see docs/specs/galeri-page-spec.md §4.4 — contract decision pending).
 */
export type GalleryCategoryId =
  | ""
  | "pernikahan"
  | "korporat"
  | "prasmanan"
  | "tumpeng-syukuran"
  | "perayaan"
  | "hampers"
  | "di-balik-dapur"

/** A concrete category a gallery entry can belong to (never "Semua"). */
export type GalleryItemCategory = Exclude<GalleryCategoryId, "">

export interface GalleryCategory {
  /** URL slug value; "" = "Semua" (the no-filter entry). */
  id: GalleryCategoryId
  /** Pill label, e.g. "Pernikahan". */
  label: string
  /** HugeIcons icon — verified present in @hugeicons/core-free-icons v4.2.3. */
  icon: IconSvgElement
  /** One-line editorial descriptor used for rail headings. */
  description: string
}

/** Meta strip on the featured display, cards (peek), and lightbox footer. */
export interface GalleryEventMeta {
  /** ISO date ("2024-06-15") or free text ("Juni 2024"). Optional. */
  tanggal?: string
  /** Venue / city, e.g. "Bogor". Optional — never fabricate. */
  venue?: string
  /** Number of guests served. Optional — never fabricate. */
  jumlahTamu?: number
}

/**
 * One gallery entry.
 * Wire fields (`nama_acara`, `deskripsi_acara`, `gambar_acara`) mirror the
 * backend `GaleriResource` (../backend/app/Http/Resources/GaleriResource.php)
 * so the static loader can be swapped for React Query + Ky without touching
 * components. Presentation fields (`category`, `meta`, `hover_gambar_acara`)
 * are local enrichment — see docs/specs/galeri-page-spec.md §4.4.
 */
export interface GalleryItem {
  /** Stable slug, e.g. "pernikahan-1". */
  id: string
  /** Category slug — groups items into clusters (never ""). */
  category: GalleryItemCategory
  /** Event name, e.g. "Resepsi pernikahan yang hangat" (wire: nama_acara). */
  nama_acara: string
  /** One-to-two line editorial caption (wire: deskripsi_acara). */
  deskripsi_acara?: string
  /** Public asset path served from /assets/images/... (wire: gambar_acara). */
  gambar_acara: string
  /** Event meta strip. */
  meta: GalleryEventMeta
  /** Optional second media for the hover cross-swap (mirrors PaketCard). */
  hover_gambar_acara?: string
}
