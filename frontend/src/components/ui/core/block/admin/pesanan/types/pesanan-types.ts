import type { Paket } from "../../../paket/types/paket-types"

/* ------------------------------------------------------------------ *
 * Enums (mirror App\Enums\StatusPesananEnum)
 * ------------------------------------------------------------------ */

export const PESANAN_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
] as const

export type StatusPesanan = (typeof PESANAN_STATUSES)[number]

export const STATUS_LABELS: Record<StatusPesanan, string> = {
  pending: "Pending",
  confirmed: "Dikonfirmasi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
}

/* ------------------------------------------------------------------ *
 * Lightweight paket shape returned by GET admin/paket/search
 * ------------------------------------------------------------------ */

export interface PaketSearchOption {
  id: number
  nama_paket: string
  min_order: number | null
  /** decimal:2 cast — arrives as a string. */
  harga_per_porsi: string
  kapasitas_produksi: number | null
}

export interface PaketSearchResponse {
  status: boolean
  message: string
  data: PaketSearchOption[]
}

/* ------------------------------------------------------------------ *
 * Core entity (mirror PesananResource)
 * ------------------------------------------------------------------ */

/** Numeric decimals arrive as strings from Laravel casts (decimal:2). */
export interface Pesanan {
  id: number
  nomor_struk: string
  nama_pemesan: string
  no_telepon: string
  paket_id: number
  /** Present because every list/show response eager-loads `paket`. */
  paket: Paket | null
  jumlah_paket: number
  /** Price snapshot at order time — NOT the current paket price. */
  harga_paket_satuan: string
  detail_tambahan: string[] | null
  biaya_tambahan: string
  catatan: string | null
  /** Server-computed. Read-only everywhere in the UI. */
  total_harga: string
  status_pesanan: StatusPesanan
  created_at: string
  updated_at: string
}

/* ------------------------------------------------------------------ *
 * Query params (mirror extended index contract)
 * ------------------------------------------------------------------ */

export const PESANAN_SORTABLE_COLUMNS = [
  "created_at",
  "total_harga",
  "nomor_struk",
  "nama_pemesan",
] as const

export type PesananSortColumn = (typeof PESANAN_SORTABLE_COLUMNS)[number]
export type SortDir = "asc" | "desc"

export interface PesananListQueryParams {
  page: number
  perPage: number
  /** Multi-select status filter — serialized as repeated `status_pesanan[]` keys. */
  statuses?: StatusPesanan[]
  search?: string
  sortBy?: PesananSortColumn
  sortDir?: SortDir
}

/* ------------------------------------------------------------------ *
 * Response envelope (mirror Controller::respondWithPagination)
 * ------------------------------------------------------------------ */

export interface PesananPagination {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
  hasMore: boolean
}

export interface PesananListResponse {
  status: boolean
  message: string
  data: Pesanan[]
  meta: {
    filters: {
      status_pesanan?: StatusPesanan[]
      search?: string
    }
    pagination: PesananPagination
  }
}

export interface PesananSingleResponse {
  status: boolean
  message: string
  data: Pesanan
}

/* ------------------------------------------------------------------ *
 * Mutations
 * ------------------------------------------------------------------ */

/** POST admin/pesanan body — NO total_harga / nomor_struk / harga_paket_satuan. */
export interface PesananCreatePayload {
  nama_pemesan: string
  no_telepon: string
  paket_id: number
  jumlah_paket: number
  detail_tambahan: string[]
  biaya_tambahan: number
  catatan?: string | null
}

/** PUT admin/pesanan/{id} body — status/catatan ONLY. */
export interface PesananUpdatePayload {
  status_pesanan?: StatusPesanan
  catatan?: string | null
}

export interface DeleteResponse {
  status: boolean
  message: string
}

/* ------------------------------------------------------------------ *
 * Struk payload (mirror PesananController::struk)
 * ------------------------------------------------------------------ */

export interface StrukPayload {
  nomor_struk: string
  nama_pemesan: string
  no_telepon: string
  paket: string | null
  jumlah_paket: number
  harga_paket_satuan: string
  detail_tambahan: string[] | null
  biaya_tambahan: string
  total_harga: string
  status_pesanan: StatusPesanan
  catatan: string | null
  created_at: string
}

export interface StrukResponse {
  status: boolean
  message: string
  data: StrukPayload
}
