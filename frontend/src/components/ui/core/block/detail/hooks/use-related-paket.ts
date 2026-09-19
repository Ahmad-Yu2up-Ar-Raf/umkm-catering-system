import { useQuery } from "@tanstack/react-query"

import { api } from "@/api/client"
import { OFFLINE_PAKETS, shouldFallback, warnOffline } from "@/api/offline-fallback"
import type { Paket, PaketListResponse } from "../../paket/types/paket-types"

const RELATED_PER_PAGE = 12

/**
 * Related packages — a general catalog pool (`GET /api/v1/paket`) WITHOUT a
 * category filter, so recommendations always have enough items to mix
 * freely. The consumer excludes the current paket and caps the rail.
 */
export function useRelatedPaketQuery(enabled = true) {
  return useQuery({
    queryKey: ["paket", "related"],
    enabled,
    retry: false,
    queryFn: async (): Promise<Paket[]> => {
      try {
        const res = await api
          .get("paket", {
            searchParams: { page: "1", perPage: String(RELATED_PER_PAGE) },
          })
          .json<PaketListResponse>()
        return res.data
      } catch (error) {
        if (!shouldFallback(error)) throw error
        warnOffline("useRelatedPaketQuery", error)
        return OFFLINE_PAKETS.slice(0, RELATED_PER_PAGE)
      }
    },
  })
}
