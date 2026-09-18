import { useQuery } from "@tanstack/react-query"
import { api } from "@/api/client"

export interface VisitorsResponse {
  data: {
    totalPengunjung: number
    source: "posthog" | "fallback"
  }
}

export function FetchVisitors() {
  return useQuery<VisitorsResponse>({
    queryKey: ["admin", "visitors"],
    queryFn: async () => api.get("admin/visitors").json<VisitorsResponse>(),
    staleTime: 1000 * 60 * 5,
    // Fail fast in dev: a PostHog 401/502 is deterministic — retrying
    // just doubles the hang (3s x 2) before isError fires.
    retry: import.meta.env.DEV ? false : 1,
  })
}

export const useVisitorsQuery = FetchVisitors
