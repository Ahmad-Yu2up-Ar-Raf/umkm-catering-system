import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { api } from "@/api/client"
import type { Galeri } from "../types/galeri-types"
import type { GaleriListQueryParams } from "../types/galeri-types"
import type { Pagination } from "@/types/pagination-type"

interface GaleriListResponse {
  status: boolean
  message: string
  data: Galeri[]
  meta: { filters: unknown; pagination: Pagination }
}

/**
 * Admin galeri list — server-paginated `useQuery` over `GET /api/v1/admin/galeri`.
 */
export function useGaleriList({
  search,
  kategoriAcara,
  sortBy = "created_at",
  sortDir = "desc",
  page,
  perPage,
}: GaleriListQueryParams) {
  return useQuery({
    queryKey: ["admin", "galeri", search, kategoriAcara, sortBy, sortDir, page, perPage],

    queryFn: async () => {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("perPage", String(perPage))
      if (search) params.set("search", search)
      for (const value of kategoriAcara) params.append("kategori_acara[]", value)
      if (sortBy) params.set("sort_by", sortBy)
      if (sortDir) params.set("sort_dir", sortDir)

      const res = await api.get("admin/galeri", { searchParams: params }).json<GaleriListResponse>()

      return { items: res.data, pagination: res.meta.pagination }
    },

    placeholderData: keepPreviousData,
    staleTime: 5_000,
  })
}