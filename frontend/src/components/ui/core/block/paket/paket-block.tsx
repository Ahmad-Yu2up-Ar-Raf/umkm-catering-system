"use client"

import { useEffect, useRef } from "react"

import { useLenis } from "lenis/react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { useCatalogStore } from "@/store/catalog-store"
import { useSavedPaketStore } from "@/store/saved-paket-store"

import { CatalogHeader } from "./components/catalog-header"
import { CategoryNav } from "./components/category-nav"
import { SearchBar } from "./components/search-bar"
import { PaketGrid } from "./components/paket-grid"
import { useCatalogParams } from "./hooks/use-catalog-params"
import { usePaketQuery, useSavedPaketsSource } from "./hooks/use-paket-query"
import { useHeaderOffset } from "./hooks/use-header-offset"

/**
 * Anchor every committed filter change scrolls to. All filter writes are
 * same-page (no pathname change, `preventScrollReset`), so the global
 * `ScrollToTop` never fires — this block owns the viewport and glides
 * straight past the hero to the list instead.
 */
const LIST_ANCHOR = "paket-list"

/**
 * Katalog Paket — the public package catalog (sitemap #3).
 *
 * Composition: hero header → sticky filter bar (category + search) → grid.
 * Filters ARE the URL (`useCatalogParams`); data is React Query
 * (`usePaketQuery`, infinite pages, cursor from the server).
 *
 * Saved view (`?saved=1`): the grid shows only packages whose IDs are in the
 * persisted `useSavedPaketStore`, sourced from one bulk fetch
 * (`useSavedPaketsSource`, enabled solely here) and filtered client-side.
 *
 * Any committed filter change auto-scrolls past the hero to the list
 * (mount/hydration excluded).
 *
 * Motion: ONE GSAP reveal on the hero only (per `design-system/pages/
 * catalog.md` — opacity/y 24px, stagger 0.08s), fully gated by
 * `prefers-reduced-motion`. Nothing else animates on this page.
 */
export function PaketBlock() {
  const headerRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const top = useHeaderOffset()
  const lenis = useLenis()

  const { kategori, search, savedOnly, setKategori, setSearch, setSavedOnly } =
    useCatalogParams()
  const query = usePaketQuery({ kategori, search })

  // Saved view — local-only IDs over one bulk fetch (enabled solely here),
  // narrowed further by the active kategori/search like the server would.
  const savedIds = useSavedPaketStore((s) => s.savedIds)
  const savedSource = useSavedPaketsSource(savedOnly)
  const savedPakets = (savedSource.data ?? []).filter(
    (p) =>
      savedIds.includes(p.id) &&
      (!kategori || p.kategori_paket === kategori) &&
      (!search ||
        p.nama_paket.toLowerCase().includes(search.trim().toLowerCase()))
  )

  const pakets = savedOnly
    ? savedPakets
    : (query.data?.pages.flatMap((page) => page.data) ?? [])
  const total = savedOnly
    ? savedPakets.length
    : (query.data?.pages[0]?.meta.pagination.total ?? 0)

  // Unified filter landing: any committed filter change (category pill incl.
  // "Semua", saved toggle, applied search / clear) bypasses the hero and
  // glides straight to the package list — one rAF so the fresh layout is
  // measured before scrolling. Keyed on the URL-committed values (search is
  // debounced at its source), never the input's keystrokes. The prev-snapshot
  // guard skips the initial mount / deep-link hydration, and also absorbs
  // late Lenis arrival (values unchanged → no scroll).
  const prevFilters = useRef<{
    kategori: string
    savedOnly: boolean
    search: string
  } | null>(null)
  useEffect(() => {
    const prev = prevFilters.current
    prevFilters.current = { kategori, savedOnly, search }
    if (
      !prev ||
      (prev.kategori === kategori &&
        prev.savedOnly === savedOnly &&
        prev.search === search)
    )
      return
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(LIST_ANCHOR)
      if (!el) return
      if (lenis) lenis.scrollTo(el, { duration: reduced ? 0 : 1.1 })
      else
        el.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start",
        })
    })
    return () => cancelAnimationFrame(raf)
  }, [kategori, savedOnly, search, lenis, reduced])

  // Signal the global layout when the catalog is fully drained (CTA band +
  // footer only appear after the last page — hidden while loading/scrollable).
  const setCatalogEnded = useCatalogStore((s) => s.setEnded)
  const activeFetching = savedOnly ? savedSource.isFetching : query.isFetching
  const activeHasNext = savedOnly ? false : query.hasNextPage
  const catalogEnded = !activeFetching && !activeHasNext

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
              <CategoryNav
                active={kategori}
                onSelect={setKategori}
                savedActive={savedOnly}
                savedCount={savedIds.length}
                onToggleSaved={setSavedOnly}
              />
            </div>
            <div className="hidden w-64 shrink-0 md:block">
              <SearchBar search={search} onSearchChange={setSearch} />
            </div>
          </div>
        </div>

        <div
          id={LIST_ANCHOR}
          className="container m-auto w-full scroll-mt-24 pt-10 pb-24 md:pt-10 md:pb-32"
        >
          <PaketGrid
            pakets={pakets}
            total={total}
            isLoading={savedOnly ? savedSource.isLoading : query.isLoading}
            isPlaceholderData={savedOnly ? false : query.isPlaceholderData}
            isError={savedOnly ? savedSource.isError : query.isError}
            hasNextPage={savedOnly ? false : query.hasNextPage}
            isFetchingNextPage={savedOnly ? false : query.isFetchingNextPage}
            kategori={kategori}
            search={search}
            savedOnly={savedOnly}
            onLoadMore={() => {
              if (!savedOnly) void query.fetchNextPage()
            }}
            onRetry={() => {
              void (savedOnly ? savedSource.refetch() : query.refetch())
            }}
            onReset={() => {
              setKategori("")
              setSearch("")
              setSavedOnly(false)
            }}
          />
        </div>
      </div>
    </section>
  )
}
