import type { Pagination } from "@/types/pagination-type"

export const TESTIMONI_VISIBILITY_VALUES = ["public", "private"] as const

export type TestimoniVisibility =
  (typeof TESTIMONI_VISIBILITY_VALUES)[number]

/**
 * Query parameters for the admin testimoni list.
 */
export interface TestimoniListQueryParams {
  search: string
  visibility: string[]
  sortBy?: string
  sortDir?: "asc" | "desc"
  page: number
  perPage: number
}

export interface TestimoniPaketSummary {
  id: number
  nama_paket: string
  thumbnail: string | null
  harga_per_porsi: string | number | null
}

export interface Testimoni {
  id: number
  nama: string
  pesanan: string
  acara: string
  lokasi: string
  visibility: TestimoniVisibility
  rating: number
  tanggal_acara: string | null
  paket_id: number
  paket?: TestimoniPaketSummary | null
  created_at: string
  updated_at: string
}

export interface TestimoniListResponse {
  status: boolean
  message: string
  data: Testimoni[]
  meta: { filters: unknown; pagination: Pagination }
}

export interface TestimoniSingleResponse {
  status: boolean
  message: string
  data: Testimoni
}
