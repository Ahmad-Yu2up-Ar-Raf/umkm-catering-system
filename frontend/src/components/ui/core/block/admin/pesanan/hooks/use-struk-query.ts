import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { pesananService } from "@/services/pesanan-service"
import type { StrukPayload } from "../types/pesanan-types"

export interface StrukResult {
  data: StrukPayload | null
  isLoading: boolean
  isError: boolean
  error: Error | null
}

/**
 * Fetch struk detail for a specific pesanan.
 * Used for the invoice preview dialog.
 */
export function useStruk(id: number | null) {
  return useQuery({
    queryKey: ["struk", id],
    queryFn: async () => {
      if (!id) return null
      const res = await pesananService.struk(id)
      return res.data
    },
    enabled: !!id,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}