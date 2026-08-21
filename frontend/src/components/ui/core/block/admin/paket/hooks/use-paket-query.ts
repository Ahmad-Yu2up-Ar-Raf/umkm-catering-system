import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { api } from "@/api/client"
import type { Paket } from "../../../paket/types/paket-types"
import type { PaketListQueryParams } from "../types/paket-types"
import type { Pagination } from "@/types/pagination-type"

interface PaketListResponse {
  status: boolean
  message: string
  data: Paket[]
  meta: { filters: unknown; pagination: Pagination }
}

/**
 * Admin paket list — server-paginated `useQuery` over `GET /api/v1/admin/paket`.
 */
export function usePaketList({
  search,
  kategoriPaket,
  kategoriAcara,
  sortBy = "created_at",
  sortDir = "desc",
  page,
  perPage,
}: PaketListQueryParams) {
  return useQuery({
    queryKey: ["admin", "paket", search, kategoriPaket, kategoriAcara, sortBy, sortDir, page, perPage],

    queryFn: async () => {
      const res = await api
        .get("admin/paket", {
          searchParams: {
            page: String(page),
            perPage: String(perPage),
            ...(search ? { search } : {}),
            ...(kategoriPaket ? { kategori_paket: kategoriPaket } : {}),
            ...(kategoriAcara ? { kategori_acara: kategoriAcara } : {}),
            ...(sortBy ? { sort_by: sortBy } : {}),
            ...(sortDir ? { sort_dir: sortDir } : {}),
          },
        })
        .json<PaketListResponse>()

      return { items: res.data, pagination: res.meta.pagination }
    },

    placeholderData: keepPreviousData,
    staleTime: 5_000,
  })
}
