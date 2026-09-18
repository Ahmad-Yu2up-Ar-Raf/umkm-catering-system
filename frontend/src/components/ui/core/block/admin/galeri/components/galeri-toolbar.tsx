"use client"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  CancelCircleIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
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
  onExport: () => void
  isExporting: boolean
}

export function GaleriToolbar({
  search,
  onSearchChange,
  kategoriAcara,
  onKategoriAcaraChange,
  onClearFilters,
  hasActiveFilters,
  onAdd,
  onExport,
  isExporting,
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
            Tambah Galeri
          </Button>
        </div>
      </div>
    </div>
  )
}
