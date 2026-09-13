"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, CancelCircleIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { MultiSelectFilter } from "@/components/ui/fragments/custom-ui/multi-select-filter"
import { TESTIMONI_VISIBILITY_OPTIONS } from "../config/testimoni-visibility-options"
import { SearchBar } from "../../../paket/components/search-bar"

interface TestimoniToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  visibility: string[]
  onVisibilityChange: (value: string[]) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  onAdd: () => void
}

export function TestimoniToolbar({
  search,
  onSearchChange,
  visibility,
  onVisibilityChange,
  onClearFilters,
  hasActiveFilters,
  onAdd,
}: TestimoniToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchBar
          search={search}
          onSearchChange={onSearchChange}
          className="w-full xl:max-w-xs"
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:flex">
          <MultiSelectFilter
            options={[...TESTIMONI_VISIBILITY_OPTIONS]}
            value={visibility}
            onChange={onVisibilityChange}
            placeholder="Visibilitas"
            ariaLabel="Filter visibilitas testimoni"
          />

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={onClearFilters}
            >
              <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
              Bersihkan Filter
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 xl:ml-auto xl:pl-3">
          <Button className="w-fit" onClick={onAdd}>
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            Tambah Testimoni
          </Button>
        </div>
      </div>
    </div>
  )
}
