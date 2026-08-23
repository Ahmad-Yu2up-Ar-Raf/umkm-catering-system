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
      // Built manually so array filters serialize as repeated bracketed
      // keys (`kategori_paket[]=A&kategori_paket[]=B`) — the format Laravel
      // parses into an array. ky's object searchParams would flatten arrays
      // to "A,B" strings.
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("perPage", String(perPage))
      if (search) params.set("search", search)
      for (const value of kategoriPaket) params.append("kategori_paket[]", value)
      for (const value of kategoriAcara) params.append("kategori_acara[]", value)
      if (sortBy) params.set("sort_by", sortBy)
      if (sortDir) params.set("sort_dir", sortDir)

      const res = await api.get("admin/paket", { searchParams: params }).json<PaketListResponse>()

      return { items: res.data, pagination: res.meta.pagination }
    },

    placeholderData: keepPreviousData,
    staleTime: 5_000,
  })
}
