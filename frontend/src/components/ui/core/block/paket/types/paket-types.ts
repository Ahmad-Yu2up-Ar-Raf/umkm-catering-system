import type { Meta } from "@/types/pagination-type"

export interface PaketListResponse {
  status: boolean
  message: string
  data: Paket[]
  meta: Meta
}

export interface Paket {
  id: number
  nama_paket: string
  kategori_paket: string
  kategori_acara: string
  menu_utama: string[]
  menu_tambahan: string[]
  fasilitas_termasuk: string[]
  catatan_alergen: string
  jenis_kemasan: string
  min_order: number
  harga_per_porsi: string
  kapasitas_produksi: number
  deskripsi: string
  thumbnail: string
  images: string[]
  is_best_seller: boolean
  created_at: Date
  updated_at: Date
}

export interface PaketDetailResponse {
  status: boolean
  message: string
  data: Paket
}

