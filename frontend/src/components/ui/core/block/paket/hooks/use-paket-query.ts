import { api } from "@/api/client"
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query"

import type {
  Paket,
  PaketDetailResponse,
  PaketListResponse,
} from "../types/paket-types"

const PAKET_PER_PAGE = 9

interface UsePaketQueryParams {
  kategori: string
  search: string
}

/**
 * Catalog query — `useInfiniteQuery` over `GET /api/v1/paket`.
 * - `kategori`/`search` live in the URL (see `use-catalog-params`); they are
 *   in the queryKey, so a filter change refetches automatically.
 * - The page cursor derives from the server's `meta.pagination.hasMore` —
 *   no page state ever lives in the UI.
 * - `placeholderData: keepPreviousData` keeps the previous result rendered
 *   during a refetch (the grid dims it) instead of flashing skeletons.
 * - `staleTime: 5000` — deliberately NO `refetchInterval`: the catalog is
 *   read-only and polling would just spam the API.
 */
export function usePaketQuery({ kategori, search }: UsePaketQueryParams) {
  return useInfiniteQuery({
    queryKey: ["paket", kategori, search, PAKET_PER_PAGE],

    queryFn: async ({ pageParam }) =>
      api
        .get("paket", {
          searchParams: {
            page: String(pageParam),
            perPage: String(PAKET_PER_PAGE),
            ...(kategori ? { kategori_paket: kategori } : {}),
            ...(search ? { search } : {}),
          },
        })
        .json<PaketListResponse>(),

    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage.meta
      return pagination.hasMore ? pagination.currentPage + 1 : undefined
    },

    staleTime: 5000,
    placeholderData: keepPreviousData,
  })
}

export const FetchPaketDetail = (id: string) => {
  return useQuery({
    queryKey: ["paket", id, `paket-${id}`],
    queryFn: async () => api.get(`paket/${id}`).json<PaketDetailResponse>(),
  })
}
