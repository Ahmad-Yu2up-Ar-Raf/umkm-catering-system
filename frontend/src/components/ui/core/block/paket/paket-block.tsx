"use client"

import { useEffect, useRef, useState } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { useCatalogStore } from "@/store/catalog-store"

import { CatalogHeader } from "./components/catalog-header"
import { FilterBar } from "./components/filter-bar"
import { PaketGrid } from "./components/paket-grid"
import { useCatalogParams } from "./hooks/use-catalog-params"
import { usePaketQuery } from "./hooks/use-paket-query"

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
  const [layoutMode, setLayoutMode] = useState<"horizontal" | "grid-2" | "grid-3">("horizontal")

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

      <FilterBar
        kategori={kategori}
        search={search}
        onKategoriChange={setKategori}
        onSearchChange={setSearch}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
      />

      {/* pb-24 / md:pb-32 — breathing room below the grid so the infinite
          scroll spinner (and the trailing CTA/footer) never feel cramped. */}
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
          layoutMode={layoutMode}
          onLayoutModeChange={setLayoutMode}
          onLoadMore={query.fetchNextPage}
          onRetry={() => query.refetch()}
          onReset={() => {
            setKategori("")
            setSearch("")
          }}
        />
      </div>
    </section>
  )
}
