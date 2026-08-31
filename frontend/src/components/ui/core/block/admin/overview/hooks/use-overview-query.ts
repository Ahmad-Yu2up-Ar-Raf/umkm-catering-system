import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { api } from "@/api/client"
import type { OverviewResponse } from "../types/overview-type"

export function FetchOverview() {
  return useQuery<OverviewResponse>({
    queryKey: ["admin", "overview"],
    queryFn: async () => api.get("admin/overview").json<OverviewResponse>(),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  })
}

export const useOverviewQuery = FetchOverview
