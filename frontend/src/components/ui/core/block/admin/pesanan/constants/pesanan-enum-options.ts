import type { MultiSelectOption } from "@/components/ui/core/block/admin/shared/multi-select-filter"

/** Options fed to MultiSelectFilter for status filter. */
export const STATUS_FILTER_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Dikonfirmasi" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
] as const satisfies readonly MultiSelectOption[]

export const METODE_PEMBAYARAN_FILTER_OPTIONS = [
  { value: "cash", label: "Tunai" },
  { value: "transfer", label: "Transfer" },
  { value: "qris", label: "QRIS" },
] as const satisfies readonly MultiSelectOption[]