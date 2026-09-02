import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { api } from "@/api/client"
import type { OverviewResponse } from "../types/overview-type"
import type { DateRange } from "react-day-picker"

function formatDateParam(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function FetchOverview(dateRange?: DateRange) {
  // Defensive: if only `from` selected, default `to` to same day
  const rawFrom = dateRange?.from
  const rawTo = dateRange?.to ?? dateRange?.from
  const from = rawFrom ? formatDateParam(rawFrom) : undefined
  const to = rawTo ? formatDateParam(rawTo) : undefined

  return useQuery<OverviewResponse>({
    queryKey: ["admin", "overview", from, to],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (from) searchParams.set("start_date", from)
      if (to) searchParams.set("end_date", to)
      const qs = searchParams.toString()
      const url = qs ? `admin/overview?${qs}` : "admin/overview"
      return api.get(url).json<OverviewResponse>()
    },
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  })
}

export const useOverviewQuery = FetchOverview
