"use client"

import { useHeaderOffset } from "../hooks/use-header-offset"
import type { KategoriFilter } from "../data/categories"
import { CategoryNav } from "./category-nav"
import { SearchBar } from "./search-bar"

/**
 * FilterBar — the sticky category + search strip (Dapur Solo's
 * `#lunchbox-page-header` adapted to a filter-driven page). It pins below the
 * global SiteHeader (`useHeaderOffset`) with a hairline border and a warm
 * cream translucent backdrop. Layout: category nav wraps to a second row on
 * narrow screens; search sits right of it from md up (design rule §8: no
 * horizontal page scroll).
 */
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
      className="sticky  z-40  py-2.5  border-b border-border bg-background/90 backdrop-blur-sm"
    >
      <div className="mx-auto px-6 flex max-w-5xl flex-col gap-3 md:flex-row md:items-center md:gap-6">
        <CategoryNav active={kategori} onSelect={onKategoriChange} />
        <div className="w-full md:ml-auto md:w-64">
          <SearchBar search={search} onSearchChange={onSearchChange} />
        </div>
      </div>
    </div>
  )
}
