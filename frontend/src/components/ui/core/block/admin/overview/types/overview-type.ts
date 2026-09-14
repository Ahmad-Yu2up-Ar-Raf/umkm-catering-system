import type {
  MetodePembayaran,
  StatusPesanan,
} from "@/components/ui/core/block/admin/pesanan/types/pesanan-types"

export interface OverviewResponse {
  reports: Reports
}

export interface Reports {
  totalPaket: number
  totalPesanan: number
  totalPesananPending: number
  /** Gross revenue (excludes cancelled), same date scope as the other totals. */
  totalPendapatan: number
  totalGaleri: number

  topPaket: TopPaket[]
  countsByDate: CountsByDate[]
  /** 5 most recent orders — flat array, no pagination. */
  latestPesanan: LatestPesanan[]
}

export interface CountsByDate {
  date: string
  pesanan: number
  pendapatan: number
}

export interface TopPaket {
  id: number
  nama_paket: string
  thumbnail: string | null
  pesanan_count: number
  is_best_seller: boolean
}

/** Simplified order row for the overview latest-orders strip (mirrors PesananResource fields). */
export interface LatestPesanan {
  id: number
  nomor_struk: string
  nama_pemesan: string
  no_telepon: string
  paket_id: number
  paket: { id: number; nama_paket: string } | null
  jumlah_paket: number
  /** Server-computed decimal — arrives as a string (decimal:2 cast). */
  total_harga: string
  status_pesanan: StatusPesanan
  metode_pembayaran: MetodePembayaran | null
  tanggal_acara: string | null
  created_at: string
  updated_at: string
}
