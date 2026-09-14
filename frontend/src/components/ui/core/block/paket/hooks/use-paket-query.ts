import { api } from "@/api/client"
import {
  filterOfflinePakets,
  OFFLINE_PAKETS,
  shouldFallback,
  warnOffline,
} from "@/api/offline-fallback"
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query"

import type { PaketListResponse } from "../types/paket-types"

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

    queryFn: async ({ pageParam }) => {
      try {
        return await api
          .get("paket", {
            searchParams: {
              page: String(pageParam),
              perPage: String(PAKET_PER_PAGE),
              ...(kategori ? { kategori_paket: kategori } : {}),
              ...(search ? { search } : {}),
            },
          })
          .json<PaketListResponse>()
      } catch (error) {
        if (!shouldFallback(error)) throw error
        warnOffline("usePaketQuery", error)
        // ponytail: client-side filter + slice; single fabricated page,
        // hasMore:false so the sentinel retires and footer/CTA render.
        const all = filterOfflinePakets(kategori, search)
        const page = Number(pageParam)
        const slice = all.slice(
          (page - 1) * PAKET_PER_PAGE,
          page * PAKET_PER_PAGE
        )
        return {
          status: true,
          message: "offline fallback",
          data: slice,
          meta: {
            filters: { search },
            pagination: {
              total: all.length,
              currentPage: page,
              perPage: PAKET_PER_PAGE,
              lastPage: Math.max(1, Math.ceil(all.length / PAKET_PER_PAGE)),
              hasMore: page * PAKET_PER_PAGE < all.length,
            },
          },
        } satisfies PaketListResponse
      }
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage.meta
      return pagination.hasMore ? pagination.currentPage + 1 : undefined
    },

    staleTime: 5000,
    placeholderData: keepPreviousData,
    // ponytail: offline fallback lives in queryFn's catch — retrying first
    // would hold skeletons/sentinels for 30s x attempts before it runs.
    retry: false,
  })
}

/** Homepage "Pilihan Menu" — the Top N most-ordered packages.
 *  ONE request for the full catalog (`perPage=500` — the dev backend is a
 *  single-threaded `php artisan serve`, so batching is a round-trip win),
 *  sorted client-side by `pesanan_count` (the honest "most ordered") and
 *  sliced to the top N. `pesanan_count` ships on `/paket` via
 *  `withCount('pesanan')`; the `/paket/best-seller` endpoint does NOT count
 *  orders, so it can't rank by popularity. */
const HOME_MENU_LIMIT = 7

export function useBestSellerPakets() {
  return useQuery({
    queryKey: ["paket", "home", "menu"],
    staleTime: 1000 * 60 * 5,
    retry: false,
    queryFn: async () => {
      try {
        const res = await api
          .get("paket", {
            searchParams: { page: "1", perPage: "500" },
          })
          .json<PaketListResponse>()
        return res.data
          .slice()
          .sort((a, b) => b.pesanan_count - a.pesanan_count)
          .slice(0, HOME_MENU_LIMIT)
      } catch (error) {
        if (!shouldFallback(error)) throw error
        warnOffline("useBestSellerPakets", error)
        return OFFLINE_PAKETS.slice()
          .sort((a, b) => b.pesanan_count - a.pesanan_count)
          .slice(0, HOME_MENU_LIMIT)
      }
    },
  })
}

/**
 * Saved-packages source — ONE bulk fetch (`perPage=500`, same batching
 * rationale as `useBestSellerPakets`), `enabled` ONLY in the `?saved=1` view.
 * The caller filters the rows by the persisted ID list client-side; no server
 * support is needed because "saved" is local-only UI state.
 */
export function useSavedPaketsSource(enabled: boolean) {
  return useQuery({
    queryKey: ["paket", "saved-source"],
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
    queryFn: async () => {
      try {
        const res = await api
          .get("paket", {
            searchParams: { page: "1", perPage: "500" },
          })
          .json<PaketListResponse>()
        return res.data
      } catch (error) {
        if (!shouldFallback(error)) throw error
        warnOffline("useSavedPaketsSource", error)
        return OFFLINE_PAKETS
      }
    },
  })
}
