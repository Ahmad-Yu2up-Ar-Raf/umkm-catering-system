import { HTTPError } from "ky"
import { useQuery } from "@tanstack/react-query"

import { api } from "@/api/client"
import type { Paket } from "../../paket/types/paket-types"
import type { PaketDetailResponse } from "../types/detail-types"

const NUMERIC_ID = /^\d+$/

/**
 * Paket detail query — `GET /api/v1/paket/{paket}` (public, no auth).
 *
 * - queryKey `["paket","detail",id]` — one request per id, cached by React
 *   Query (global 5-min staleTime); back-nav is instant and skeleton-free.
 * - `enabled:false` for a non-numeric id → NO request is fired; the block
 *   renders the not-found shell instead.
 * - `isNotFound` — true when the id is invalid OR the API answered HTTP 404
 *   (the only terminal states that should look like a missing paket).
 * - the envelope is unwrapped here; consumers receive `data: Paket`.
 */
export const FetchPaketDetail = (id: string) => {
  const valid = NUMERIC_ID.test(id)

  const query = useQuery({
    queryKey: ["paket", "detail", id],
    enabled: valid,
    queryFn: async (): Promise<Paket> => {
      const res = await api.get(`paket/${id}`).json<PaketDetailResponse>()
      return res.data
    },
  })

  const isNotFound =
    !valid ||
    (query.error instanceof HTTPError &&
      query.error.response.status === 404)

  return { ...query, isNotFound }
}
