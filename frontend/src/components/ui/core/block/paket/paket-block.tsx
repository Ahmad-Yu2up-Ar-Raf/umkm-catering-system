"use client"

import { useEffect, useRef } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { useCatalogStore } from "@/store/catalog-store"

import { CatalogHeader } from "./components/catalog-header"
import { CategoryNav } from "./components/category-nav"
import { SearchBar } from "./components/search-bar"
import { PaketGrid } from "./components/paket-grid"
import { useCatalogParams } from "./hooks/use-catalog-params"
import { usePaketQuery } from "./hooks/use-paket-query"
import { useHeaderOffset } from "./hooks/use-header-offset"

/**
 * Katalog Paket — the public package catalog (sitemap #3).
 *
 * Composition: hero header → sticky filter bar (category + search) → grid.
 * Filters ARE the URL (`useCatalogParams`); data is React Query
 * (`usePaketQuery`, infinite pages, cursor from the server).
 *
 * Motion: ONE GSAP reveal on the hero only (per `design-system/pages/
 * catalog.md` — opacity/y 24px, stagger 0.08s), fully gated by
 * `prefers-reduced-motion`. Nothing else animates on this page.
 */
export function PaketBlock() {
  const headerRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const top = useHeaderOffset()

  const { kategori, search, setKategori, setSearch } = useCatalogParams()
  const query = usePaketQuery({ kategori, search })

  const pakets = query.data?.pages.flatMap((page) => page.data) ?? []
  const total = query.data?.pages[0]?.meta.pagination.total ?? 0

  // Signal the global layout when the catalog is fully drained (CTA band +
  // footer only appear after the last page — hidden while loading/scrollable).
  const setCatalogEnded = useCatalogStore((s) => s.setEnded)
  const catalogEnded = !query.isFetching && !query.hasNextPage

  useEffect(() => {
    setCatalogEnded(catalogEnded)
  }, [catalogEnded, setCatalogEnded])

  useGSAP(
    () => {
      const el = headerRef.current
      if (!el) return

      const items = gsap.utils.selector(el)("[data-catalog-reveal]")

      if (reduced) {
        gsap.set(items, { autoAlpha: 1, y: 0 })
        return
      }

      gsap.set(items, { autoAlpha: 0, y: 24 })
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
      })
    },
    { scope: headerRef }
  )

  return (
    <section id="katalog-paket" className="flex flex-col">
      <div ref={headerRef} className="container m-auto w-full">
        <CatalogHeader />
      </div>

      {/* Mobile Search — scrolls away with document flow (non-sticky) */}
      <div className="container m-auto w-full  md:hidden">
        <div className="py-3">
          <SearchBar search={search} onSearchChange={setSearch} />
        </div>
      </div>

      {/* Shared sticky track: CategoryNav (+ desktop Search) shares bounding box
          with PaketGrid so sticky persists for full scroll length. */}
      <div className="flex flex-col">
        <div
          style={{ top: typeof top !== "undefined" ? top : 0 }}
          className="sticky top-0 z-40 w-full border-b border-border bg-background/95 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <div className="mx-auto flex max-w-5xl items-center gap-4  md:gap-6 md:px-6">
            <div className="min-w-0 flex-1">
              <CategoryNav active={kategori} onSelect={setKategori} />
            </div>
            <div className="hidden w-64 shrink-0 md:block">
              <SearchBar search={search} onSearchChange={setSearch} />
            </div>
          </div>
        </div>

        <div className="container m-auto w-full pt-10 pb-24 md:pt-10 md:pb-32">
        <PaketGrid
          pakets={pakets}
          total={total}
          isLoading={query.isLoading}
          isPlaceholderData={query.isPlaceholderData}
          isError={query.isError}
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          kategori={kategori}
          search={search}
          onLoadMore={query.fetchNextPage}
          onRetry={() => query.refetch()}
          onReset={() => {
            setKategori("")
            setSearch("")
          }}
        />
        </div>
      </div>
    </section>
  )
}
