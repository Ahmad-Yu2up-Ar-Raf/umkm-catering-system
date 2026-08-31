// =============================================================================
// ANALYTICS CHART CONFIG — Catering Nusantara (Admin Overview)
// Mirrors KlikAntri analytics-chart-config shape, domain-translated to catering
// =============================================================================
import type { ChartConfig } from "@/components/ui/fragments/shadcn-ui/chart"

export const distributionColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const

// ============================================
// CATERING DISTRIBUTION CONFIGS
// ============================================

export const pesananStatusChartConfig: ChartConfig = {
  count: { label: "Jumlah" },
  pending: { label: "Pending", color: "var(--chart-3)" },
  confirmed: { label: "Dikonfirmasi", color: "var(--chart-1)" },
  completed: { label: "Selesai", color: "var(--chart-2)" },
  cancelled: { label: "Dibatalkan", color: "var(--chart-5)" },
}

export const kategoriPaketChartConfig: ChartConfig = {
  count: { label: "Jumlah" },
  "Nasi Box": { label: "Nasi Box", color: "var(--chart-1)" },
  Prasmanan: { label: "Prasmanan", color: "var(--chart-2)" },
  Snack: { label: "Snack", color: "var(--chart-3)" },
  Tumpeng: { label: "Tumpeng", color: "var(--chart-4)" },
}

export const paketAcaraChartConfig: ChartConfig = {
  count: { label: "Jumlah" },
  Pernikahan: { label: "Pernikahan", color: "var(--chart-1)" },
  Kantor: { label: "Kantor", color: "var(--chart-2)" },
  "Ulang Tahun": { label: "Ulang Tahun", color: "var(--chart-3)" },
  Arisan: { label: "Arisan", color: "var(--chart-4)" },
  Umum: { label: "Umum", color: "var(--chart-5)" },
}

// Keep helper shape (mirrors getAntrianStatusLabel pattern)
export function getPesananStatusLabel(status: string): string {
  const config = pesananStatusChartConfig[status]
  return typeof config?.label === "string" ? config.label : status
}

export function getKategoriPaketLabel(kategori: string): string {
  const config = kategoriPaketChartConfig[kategori]
  return typeof config?.label === "string" ? config.label : kategori
}

export function getPaketAcaraLabel(kategori: string): string {
  const config = paketAcaraChartConfig[kategori]
  return typeof config?.label === "string" ? config.label : kategori
}

// Retain legacy gender helper name for any stray import (no-op mapping)
export function getGenderLabel(gender: string): string {
  return gender
}
