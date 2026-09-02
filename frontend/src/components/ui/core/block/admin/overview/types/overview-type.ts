export interface OverviewResponse {
  reports: Reports
}

export interface Reports {
  totalPaket: number
  totalPesanan: number
  totalPesananPending: number
  totalGaleri: number

  topPaket: TopPaket[]
  countsByDate: CountsByDate[]
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
