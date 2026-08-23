/**
 * Query parameters for the admin galeri list.
 */
export interface GaleriListQueryParams {
  search: string
  kategoriAcara: string[]
  sortBy?: string
  sortDir?: "asc" | "desc"
  page: number
  perPage: number
}

export interface Galeri {
  id: number
  nama_acara: string
  kategori_acara: string
  deskripsi_acara: string | null
  gambar_acara: string
  thumbnail: string | null
  images: string[]
  tanggal_acara: string | null
  lokasi: string | null
  jumlah_tamu: number | null
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface GaleriListResponse {
  status: boolean
  message: string
  data: Galeri[]
  meta: { filters: unknown; pagination: Pagination }
}

import type { Pagination } from "@/types/pagination-type"