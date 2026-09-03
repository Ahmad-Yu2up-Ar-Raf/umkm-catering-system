"use client"

import { useHeaderOffset } from "../hooks/use-header-offset"
import { MultiSelectFilter } from "@/components/ui/fragments/custom-ui/multi-select-filter"
import {
  PAKET_KATEGORI_OPTIONS,
  KATEGORI_ACARA_OPTIONS,
} from "@/components/ui/core/block/admin/paket/config/paket-enum-options"
import { SearchBar } from "./search-bar"

export function FilterBar({
  kategoriPaket,
  kategoriAcara,
  search,
  onKategoriPaketChange,
  onKategoriAcaraChange,
  onSearchChange,
}: {
  kategoriPaket: string[]
  kategoriAcara: string[]
  search: string
  onKategoriPaketChange: (values: string[]) => void
  onKategoriAcaraChange: (values: string[]) => void
  onSearchChange: (term: string) => void
}) {
  const top = useHeaderOffset()

  return (
    <div
      style={{ top }}
      className="sticky z-40 border-b border-border bg-background/90 py-2.5 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 md:flex-row md:items-center md:justify-between md:gap-4 md:px-6">
        {/* Left: two multi-selects side-by-side */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
          <MultiSelectFilter
            options={PAKET_KATEGORI_OPTIONS}
            value={kategoriPaket}
            onChange={onKategoriPaketChange}
            placeholder="Kategori Paket"
            ariaLabel="Filter kategori paket"
          />
          <MultiSelectFilter
            options={KATEGORI_ACARA_OPTIONS}
            value={kategoriAcara}
            onChange={onKategoriAcaraChange}
            placeholder="Kategori Acara"
            ariaLabel="Filter kategori acara"
          />
        </div>
        {/* Right: search bar */}
        <div className="w-full sm:ml-auto sm:max-w-[320px] md:w-64 md:shrink-0">
          <SearchBar search={search} onSearchChange={onSearchChange} />
        </div>
      </div>
    </div>
  )
}
