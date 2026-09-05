"use client"

import { useHeaderOffset } from "../hooks/use-header-offset"
import type { KategoriFilter } from "../data/categories"
import { CategoryNav } from "./category-nav"
import { SearchBar } from "./search-bar"

export function FilterBar({
  kategori,
  search,
  onKategoriChange,
  onSearchChange,
}: {
  kategori: KategoriFilter
  search: string
  onKategoriChange: (value: KategoriFilter) => void
  onSearchChange: (term: string) => void
}) {
  const top = useHeaderOffset()

  return (
    <div
      style={{ top }}
      className="sticky z-40 border-b border-border bg-background/95 py-2.5 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 md:flex-row md:items-center md:gap-6 md:px-6">
        <div className="w-full md:order-2 md:ml-auto md:w-64">
          <SearchBar search={search} onSearchChange={onSearchChange} />
        </div>
        <div className="min-w-0 flex-1 md:order-1">
          <CategoryNav active={kategori} onSelect={onKategoriChange} />
        </div>
      </div>
    </div>
  )
}
