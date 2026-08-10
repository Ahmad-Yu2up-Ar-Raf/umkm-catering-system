/**
 * Catalog types — mirror of `backend/app/Http/Resources/PaketResource.php`
 * and the paginated envelope of `PaketController@index`. Contract source:
 * `backend/docs/api-collection.md` (never duplicate the API docs here).
 */

export interface Paket {
  id: number
  nama_paket: string
  kategori_paket: string
  kategori_acara: string | null
  menu_utama: string[]
  menu_tambahan: string[]
  fasilitas_termasuk: string[]
  catatan_alergen: string | null
  jenis_kemasan: string | null
  min_order: number
  /** decimal:2 → serialized as string (e.g. "22000.00"); Number() before formatting. */
  harga_per_porsi: string | number
  kapasitas_produksi: number | null
  deskripsi: string | null
  thumbnail: string | null
  images: string[] | null
  is_best_seller: boolean
  created_at: string
  updated_at: string
}

export interface PaginationMeta {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
  hasMore: boolean
}

export interface PaketListResponse {
  status: boolean
  message: string
  data: Paket[]
  meta: {
    filters: Partial<Record<string, string>>
    pagination: PaginationMeta
  }
}
