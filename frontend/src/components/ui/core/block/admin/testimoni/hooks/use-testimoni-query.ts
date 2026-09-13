import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { api } from "@/api/client"
import type {
  TestimoniListQueryParams,
  TestimoniListResponse,
} from "../types/testimoni-types"

/**
 * Admin testimoni list — server-paginated `useQuery` over
 * `GET /api/v1/admin/testimoni`. Visibility serializes as repeated
 * bracketed keys (`visibility[]=public&visibility[]=private`) — the format
 * Laravel parses into an array.
 */
export function useTestimoniList({
  search,
  visibility,
  sortBy = "created_at",
  sortDir = "desc",
  page,
  perPage,
}: TestimoniListQueryParams) {
  return useQuery({
    queryKey: ["admin", "testimoni", search, visibility, sortBy, sortDir, page, perPage],

    queryFn: async () => {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("perPage", String(perPage))
      if (search) params.set("search", search)
      for (const value of visibility) params.append("visibility[]", value)
      if (sortBy) params.set("sort_by", sortBy)
      if (sortDir) params.set("sort_dir", sortDir)

      const res = await api
        .get("admin/testimoni", { searchParams: params })
        .json<TestimoniListResponse>()

      return { items: res.data, pagination: res.meta.pagination }
    },

    placeholderData: keepPreviousData,
    staleTime: 5_000,
  })
}
