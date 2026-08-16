import { useQuery } from "@tanstack/react-query"

import { api } from "@/api/client"
import type { Paket, PaketListResponse } from "../../paket/types/paket-types"

const RELATED_PER_PAGE = 12

/**
 * Related packages — a general catalog pool (`GET /api/v1/paket`) WITHOUT a
 * category filter, so recommendations always have enough items to mix
 * freely. The consumer excludes the current paket and caps the rail.
 */
export function useRelatedPaketQuery() {
  return useQuery({
    queryKey: ["paket", "related"],
    queryFn: async (): Promise<Paket[]> => {
      const res = await api
        .get("paket", {
          searchParams: { page: "1", perPage: String(RELATED_PER_PAGE) },
        })
        .json<PaketListResponse>()
      return res.data
    },
  })
}
