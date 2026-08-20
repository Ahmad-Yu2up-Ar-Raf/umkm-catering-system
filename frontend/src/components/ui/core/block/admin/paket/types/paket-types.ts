/**
 * Query parameters for the admin paket list. The wire shape is the shared
 * public `Paket` type from `block/paket/types` — no separate admin shape.
 */
export interface PaketListQueryParams {
  search: string
  kategoriPaket: string
  kategoriAcara: string
  page: number
  perPage: number
}
