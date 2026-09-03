"use client"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, CancelCircleIcon } from "@hugeicons/core-free-icons"
import { GALERI_KATEGORI_OPTIONS } from "../config/galeri-enum-options"
import { GaleriViewToggle } from "./galeri-view-toggle"
import { MultiSelectFilter } from "../../../../../fragments/custom-ui/multi-select-filter"
import { SearchBar } from "../../../paket/components/search-bar"

interface GaleriToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  kategoriAcara: string[]
  onKategoriAcaraChange: (value: string[]) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  onAdd: () => void
}

export function GaleriToolbar({
  search,
  onSearchChange,
  kategoriAcara,
  onKategoriAcaraChange,
  onClearFilters,
  hasActiveFilters,
  onAdd,
}: GaleriToolbarProps) {
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
            options={GALERI_KATEGORI_OPTIONS}
            value={kategoriAcara}
            onChange={onKategoriAcaraChange}
            placeholder="Kategori Acara"
            ariaLabel="Filter kategori acara"
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
          <GaleriViewToggle />
          <Button className="w-fit" onClick={onAdd}>
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            Tambah Galeri
          </Button>
        </div>
      </div>
    </div>
  )
}
