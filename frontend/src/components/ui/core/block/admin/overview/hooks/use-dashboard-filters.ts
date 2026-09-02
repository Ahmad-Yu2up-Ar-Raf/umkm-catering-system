"use client"

import { create } from "zustand"
import type { DateRange } from "react-day-picker"

interface DashboardFiltersState {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  clearFilters: () => void
}

const useDashboardFiltersStore = create<DashboardFiltersState>((set) => ({
  dateRange: undefined,
  setDateRange: (range) => set({ dateRange: range }),
  clearFilters: () => set({ dateRange: undefined }),
}))

export function useDashboardFilters() {
  const { dateRange, setDateRange, clearFilters } = useDashboardFiltersStore()
  const hasActiveFilters = !!dateRange?.from || !!dateRange?.to

  return {
    dateRange,
    setDateRange,
    clearFilters,
    hasActiveFilters,
  }
}
