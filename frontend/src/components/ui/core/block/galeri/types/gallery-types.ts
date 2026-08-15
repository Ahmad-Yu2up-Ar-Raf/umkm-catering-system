import type { IconSvgElement } from "@hugeicons/react"

/**
 * URL value for `?kategori_acara=` — "" = "Semua" (param omitted).
 *
 * Values are the raw backend `GaleriKategoriEnum` strings (architectural
 * blueprint §2.1). Kept as the API contract so `?kategori_acara=Pernikahan`
 * round-trips cleanly with no slug↔enum mapping that can drift.
 */
export type GalleryCategoryId =
  | ""
  | "Pernikahan"
  | "Korporat"
  | "Tumpeng & Syukuran"
  | "Perayaan"
  | "Hampers"
  | "Di Balik Dapur"
  | "Lainnya"

/** A concrete category a gallery entry can belong to (never "Semua"). */
export type GalleryItemCategory = Exclude<GalleryCategoryId, "">

export interface GalleryCategory {
  /** URL value; "" = "Semua" (the no-filter entry). */
  id: GalleryCategoryId
  /** Route slug — the deep-linkable `/galeri/:kategori` segment. */
  slug: string
  /** Pill label. */
  label: string
  /** HugeIcons icon — verified present in @hugeicons/core-free-icons v4.2.3. */
  icon: IconSvgElement
  /** One-line editorial descriptor used for rail headings. */
  description: string
}

/** Meta strip on the featured display, cards (peek), and global modal. */
export interface GalleryEventMeta {
  /** ISO date ("2026-06-15") or free text. Optional. */
  tanggal?: string
  /** Venue / city (API: lokasi). Optional. */
  venue?: string
  /** Number of guests served (API: jumlah_tamu). Optional. */
  jumlahTamu?: number
}

/**
 * One gallery entry — the normalized presentation model.
 * Wire fields (`nama_acara`, `deskripsi_acara`, `gambar_acara`,
 * `tanggal_acara`, `kategori_acara`, `lokasi`, `jumlah_tamu`,
 * `is_featured`) mirror `GaleriResource`.
 */
export interface GalleryItem {
  id: string
  /** Category value (API: kategori_acara). */
  category: GalleryItemCategory
  /** Event name (API: nama_acara). */
  nama_acara: string
  /** One-to-two line editorial caption (API: deskripsi_acara). */
  deskripsi_acara?: string
  /** Public asset path or Cloudinary URL (API: gambar_acara). */
  gambar_acara: string
  /** Event meta strip. */
  meta: GalleryEventMeta
  /** Signature event for the hero (API: is_featured). */
  is_featured?: boolean
}
