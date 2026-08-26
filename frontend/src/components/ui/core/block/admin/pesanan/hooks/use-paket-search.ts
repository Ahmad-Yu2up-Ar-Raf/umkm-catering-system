import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { pesananService } from "@/services/pesanan-service"
import { useDebouncedValue } from "../../paket/hooks/use-debounced-value"

/**
 * Debounced async package lookup feeding the POS paket combobox.
 * The caller passes the RAW input; debouncing (300 ms) happens here so
 * keystroke churn never hits `GET /admin/paket/search` directly.
 */
export function usePaketSearch(query: string) {
  const debouncedQuery = useDebouncedValue(query.trim(), 300)

  return useQuery({
    queryKey: ["admin", "paket-search", debouncedQuery],
    queryFn: () => pesananService.searchPaket(debouncedQuery),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}
