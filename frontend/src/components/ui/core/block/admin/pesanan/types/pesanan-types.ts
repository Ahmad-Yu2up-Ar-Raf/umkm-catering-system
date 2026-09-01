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
 * Payment Method Enum
 * ------------------------------------------------------------------ */

export const METODE_PEMBAYARAN = [
  "transfer",
  "cash",
  "qris",
] as const

export type MetodePembayaran = (typeof METODE_PEMBAYARAN)[number]

export const METODE_PEMBAYARAN_LABELS: Record<MetodePembayaran, string> = {
  transfer: "Transfer Bank",
  cash: "Tunai",
  qris: "QRIS",
}

/* ------------------------------------------------------------------ *
 * Lightweight paket shape returned by GET admin/paket/search
 * ------------------------------------------------------------------ */

export interface PaketSearchOption {
  id: number
  nama_paket: string
  thumbnail: string | null
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
  alamat: string | null
  paket_id: number
  /** Present because every list/show response eager-loads `paket`. */
  paket: Paket | null
  jumlah_paket: number
  /** Event date — YYYY-MM-DD string from API (nullable for legacy rows). */
  tanggal_acara: string | null
  /** Price snapshot at order time — NOT the current paket price. */
  harga_paket_satuan: string
  detail_tambahan: string[] | null
  menu_tambahan: string[] | null
  biaya_tambahan: string | null
  catatan: string | null
  /** Server-computed. Read-only everywhere in the UI. */
  total_harga: string
  status_pesanan: StatusPesanan
  metode_pembayaran: MetodePembayaran | null
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
  metodePembayaran?: MetodePembayaran[]
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
      metode_pembayaran?: MetodePembayaran[]
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
  alamat?: string | null
  paket_id: number
  jumlah_paket: number
  tanggal_acara: string
  status_pesanan?: StatusPesanan | null
  metode_pembayaran?: MetodePembayaran | null
  menu_tambahan?: string[] | null
  detail_tambahan: string[]
  biaya_tambahan?: number | null
  catatan?: string | null
}

/** PUT admin/pesanan/{id} body — status/catatan/tanggal ONLY; financials are immutable. */
export interface PesananUpdatePayload {
  status_pesanan?: StatusPesanan | null
  metode_pembayaran?: MetodePembayaran | null
  tanggal_acara?: string
  alamat?: string | null
  biaya_tambahan?: number | null
  detail_tambahan?: string[] | null
  menu_tambahan?: string[] | null
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
  alamat: string | null
  paket: string | null
  jumlah_paket: number
  tanggal_acara: string | null
  harga_paket_satuan: string
  detail_tambahan: string[] | null
  menu_tambahan: string[] | null
  biaya_tambahan: string | null
  total_harga: string
  status_pesanan: StatusPesanan
  metode_pembayaran: MetodePembayaran | null
  catatan: string | null
  created_at: string
}

export interface StrukResponse {
  status: boolean
  message: string
  data: StrukPayload
}