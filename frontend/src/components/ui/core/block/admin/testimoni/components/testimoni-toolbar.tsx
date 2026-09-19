"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  CancelCircleIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
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
  onExport: () => void
  isExporting: boolean
}

export function TestimoniToolbar({
  search,
  onSearchChange,
  visibility,
  onVisibilityChange,
  onClearFilters,
  hasActiveFilters,
  onAdd,
  onExport,
  isExporting,
}: TestimoniToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchBar
          search={search}
          onSearchChange={onSearchChange}
          className="w-full xl:max-w-xs"
        />

        <div className="grid md:w-fit w-full grid-cols-1 gap-2 md:flex">
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

        <div className="hidden items-center gap-3 md:flex xl:ml-auto xl:pl-3">
          <Button
            type="button"
            variant="outline"
            size={"lg"}
            onClick={onExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Spinner className="mr-2 size-4" />
            ) : (
              <HugeiconsIcon icon={Download01Icon} className="mr-2 size-4" />
            )}
            {isExporting ? "Mengekspor…" : "Export"}
          </Button>
          <Button  size={"lg"} onClick={onAdd}>
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            Tambah Testimoni
          </Button>
        </div>
      </div>

      <div className="md:hidden">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onExport}
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <Spinner className="mr-2 size-4" />
          ) : (
            <HugeiconsIcon icon={Download01Icon} className="mr-2 size-4" />
          )}
          {isExporting ? "Mengekspor…" : "Export"}
        </Button>
      </div>
    </div>
  )
}
