"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { MultiSelectFilter } from "@/components/ui/core/block/admin/shared/multi-select-filter"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { METODE_PEMBAYARAN_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from "../constants/pesanan-enum-options"
import { SearchBar } from "../../../paket/components/search-bar"

interface PesananToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  statuses: string[]
  onStatusesChange: (value: string[]) => void
  metodePembayaran: string[]
  onMetodePembayaranChange: (value: string[]) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  onAdd: () => void
}

export function PesananToolbar({
  search,
  onSearchChange,
  statuses,
  onStatusesChange,
  metodePembayaran,
  onMetodePembayaranChange,
  onClearFilters,
  hasActiveFilters,
  onAdd,
}: PesananToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <SearchBar
          search={search}
          onSearchChange={onSearchChange}
          className="w-full xl:max-w-xs"
        />
        <MultiSelectFilter
          options={STATUS_FILTER_OPTIONS}
          value={statuses}
          onChange={onStatusesChange}
          placeholder="Filter status"
          ariaLabel="Filter status pesanan"
        />
        <MultiSelectFilter
          options={METODE_PEMBAYARAN_FILTER_OPTIONS}
          value={metodePembayaran}
          onChange={onMetodePembayaranChange}
          placeholder="Filter pembayaran"
          ariaLabel="Filter metode pembayaran"
        />
      </div>

      <div className="flex items-center gap-2 sm:ml-auto">
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Bersihkan filter
          </Button>
        )}
        <Button onClick={onAdd} size="sm">
          <HugeiconsIcon icon={PlusSignIcon} className="mr-2 size-4" />
          Tambah Pesanan
        </Button>
      </div>
    </div>
  )
}
