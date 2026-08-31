import { useQuery } from "@tanstack/react-query"
import { api } from "@/api/client"
import type { Paket } from "../../../paket/types/paket-types"

interface PaketDetailResponse {
  status: boolean
  message: string
  data: Paket
}

/**
 * Fetch-on-select: full paket detail (thumbnail, harga, etc.)
 * Uses public GET /paket/{id} (or admin variant) — already includes thumbnail.
 * Enabled only when paketId is a valid number.
 */
export function usePaketDetail(paketId: number | null | undefined) {
  return useQuery({
    queryKey: ["paket-detail", paketId],
    queryFn: async (): Promise<Paket> => {
      const res = await api
        .get(`paket/${paketId}`)
        .json<PaketDetailResponse>()
      return res.data
    },
    enabled: typeof paketId === "number" && Number.isFinite(paketId) && paketId > 0,
    staleTime: 30_000,
  })
}
