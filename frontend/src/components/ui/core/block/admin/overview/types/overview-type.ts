export interface OverviewResponse {
  reports: Reports
}

export interface Reports {
  totalPaket: number
  totalPesanan: number
  totalPesananPending: number
  totalGaleri: number

  pesananStatusCount: PesananStatusCount
  paketKategoriCount: PaketKategoriCount
  paketAcaraCount: PaketAcaraCount

  topPaket: TopPaket[]
  countsByDate: CountsByDate[]
}

export interface PesananStatusCount {
  pending: number
  confirmed: number
  completed: number
  cancelled: number
}

export type PaketKategoriCount = Record<string, number>
export type PaketAcaraCount = Record<string, number>

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
