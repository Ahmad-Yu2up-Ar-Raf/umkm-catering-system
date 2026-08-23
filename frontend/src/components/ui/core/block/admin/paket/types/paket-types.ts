/**
 * Query parameters for the admin paket list.
 */
export interface PaketListQueryParams {
  search: string
  kategoriPaket: string[]
  kategoriAcara: string[]
  sortBy?: string
  sortDir?: "asc" | "desc"
  page: number
  perPage: number
}
