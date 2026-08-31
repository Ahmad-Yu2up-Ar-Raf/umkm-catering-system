"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, SearchIcon } from "@hugeicons/core-free-icons"
import { MultiSelectFilter } from "@/components/ui/core/block/admin/shared/multi-select-filter"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { STATUS_FILTER_OPTIONS } from "../constants/pesanan-enum-options"
import { SearchBar } from "../../../paket/components/search-bar"

interface PesananToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  statuses: string[]
  onStatusesChange: (value: string[]) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  onAdd: () => void
}

export function PesananToolbar({
  search,
  onSearchChange,
  statuses,
  onStatusesChange,
  onClearFilters,
  hasActiveFilters,
  onAdd,
}: PesananToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <SearchBar
          search={search}
          onSearchChange={onSearchChange}
          className="w-full xl:max-w-xs"
        />
        {/* <div className="relative max-w-md flex-1">
          <HugeiconsIcon
            icon={SearchIcon}
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nomor struk"
            className="h-9 w-full rounded-full border border-border bg-background pr-4 pl-10 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
          />
        </div> */}

        <MultiSelectFilter
          options={STATUS_FILTER_OPTIONS}
          value={statuses}
          onChange={onStatusesChange}
          placeholder="Filter status"
          ariaLabel="Filter status pesanan"
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
