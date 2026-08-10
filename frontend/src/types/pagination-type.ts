export interface Meta {
  filters: Filters
  pagination: Pagination
}

export interface Filters {
  search: string
}

export interface Pagination {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
  hasMore: boolean
}
