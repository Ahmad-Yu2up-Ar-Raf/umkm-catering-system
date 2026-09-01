import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { pesananService } from "@/services/pesanan-service"
import type {
  Pesanan,
  PesananListQueryParams,
  PesananPagination,
} from "../types/pesanan-types"

export interface PesananListResult {
  items: Pesanan[]
  pagination: PesananPagination
}

/**
 * Admin pesanan list — server-paginated `useQuery` over `GET /api/v1/admin/pesanan`.
 * All filter/sort/pagination values are part of the query key; serialization
 * (repeated bracketed status keys) lives in the service layer.
 */
export function usePesananList({
  statuses = [],
  metodePembayaran = [],
  search = "",
  sortBy = "created_at",
  sortDir = "desc",
  page,
  perPage,
}: Omit<PesananListQueryParams, "search"> & { search?: string }) {
  return useQuery({
    queryKey: ["admin", "pesanan", statuses, metodePembayaran, search, sortBy, sortDir, page, perPage],

    queryFn: async (): Promise<PesananListResult> => {
      const res = await pesananService.list({ statuses, metodePembayaran, search, sortBy, sortDir, page, perPage })
      return {
        items: res.data,
        pagination: res.meta.pagination,
      }
    },

    placeholderData: keepPreviousData,
    staleTime: 5_000,
  })
}
