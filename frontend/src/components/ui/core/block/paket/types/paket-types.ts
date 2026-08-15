import type { Meta } from "@/types/pagination-type"

export interface PaketListResponse {
  status: boolean
  message: string
  data: Paket[]
  meta: Meta
}

/**
 * Wire contract of `PaketResource` — the API's true shape, including its
 * nullability. Optional data is normalized in view models, never faked here
 * because today's seed data happens to be complete.
 */
export interface Paket {
  id: number
  nama_paket: string
  /** enum → "Nasi Box" | "Prasmanan" | "Snack" | "Tumpeng" */
  kategori_paket: string
  /** enum → "Pernikahan" | "Kantor" | … — nullable on the wire */
  kategori_acara: string | null
  menu_utama: string[]
  menu_tambahan: string[] | null
  fasilitas_termasuk: string[] | null
  catatan_alergen: string | null
  jenis_kemasan: string | null
  min_order: number
  /** decimal:2 → string like "22000.00" — Number() before formatting */
  harga_per_porsi: string
  kapasitas_produksi: number | null
  deskripsi: string | null
  /** Cloudinary secure_url of the first gallery image — nullable on the wire */
  thumbnail: string | null
  images: string[]
  is_best_seller: boolean
  /** datetime strings, not Date */
  created_at: string
  updated_at: string
}
