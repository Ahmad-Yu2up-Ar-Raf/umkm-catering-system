export interface PaketResponse {
  status: boolean
  message: string
  data: Data
}

export interface Data {
  current_page: number
  data: Datum[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Link[]
  next_page_url: string
  path: string
  per_page: number
  prev_page_url: null
  to: number
  total: number
}

export interface Datum {
  id: number
  nama_paket: string
  kategori_paket: string
  kategori_acara: string
  menu_utama: string[]
  menu_tambahan: string[]
  fasilitas_termasuk: string[]
  catatan_alergen: null | string
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

export interface Link {
  url: null | string
  label: string
  page: number | null
  active: boolean
}
