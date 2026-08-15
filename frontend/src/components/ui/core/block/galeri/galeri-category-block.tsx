"use client"

import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router"

import { motion } from "framer-motion"

import { useGaleriStore } from "@/store/galeri-store"
import { useGaleriQuery } from "@/services/galeri/use-galeri-query"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"

import { getCategoryBySlug } from "./galeri-data"
import { GalleryGrid } from "./components/gallery-grid"
import { GalleryFilterBar } from "./components/gallery-filter-bar"

/** Luxury ease — premium Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/**
 * Galeri per kategori — the dedicated exploration page (`/galeri/:kategori`).
 *
 * Owns THE dataset browser: category header with live total → sticky
 * slug-based category nav → deterministic-column masonry with infinite
 * scroll. The storefront `/galeri` page handles discovery; this page handles
 * volume.
 *
 * Chrome gate (mirrors /paket): the CTA band + footer render only once the
 * infinite catalog reaches its END (`!isFetching && !hasNextPage`), never
 * under the skeleton or while another page is pending. An unknown slug is a
 * terminal page (not-found), so it flips the gate on immediately.
 */
export function GaleriCategoryBlock({ slug }: { slug: string }) {
  const navigate = useNavigate()
  const setReady = useGaleriStore((s) => s.setReady)
  const reduced = useReducedMotion()

  const category = getCategoryBySlug(slug)
  const kategori = category?.id ?? ""

  const query = useGaleriQuery({ kategori, enabled: Boolean(category) })

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  )

  // Terminal state for the layout gate — identical semantics to PaketBlock.
  const catalogEnded = !query.isFetching && !query.hasNextPage

  useEffect(() => {
    setReady(!category || catalogEnded)
  }, [category, catalogEnded, setReady])

  // Not-found shell — terminal page, honest and non-erroring.
  if (!category) {
    return (
      <section className="container m-auto flex w-full flex-col items-center gap-6 px-6 py-28 text-center">
        <p className="text-[11px] tracking-[0.34em] text-primary uppercase">
          Galeri
        </p>
        <h1 className="font-heading text-[clamp(36px,5vw,64px)] leading-tight font-light text-foreground">
          Kategori tidak <span className="font-accent italic">ditemukan</span>
        </h1>
        <p className="max-w-md text-muted-foreground">
          Momen yang Anda cari tidak tersedia. Jelajahi semua galeri perayaan
          kami sebagai gantinya.
        </p>
        <Button variant="outline" onClick={() => navigate("/galeri")}>
          Lihat semua momen
        </Button>
      </section>
    )
  }

  // Header reveal — blur + fade-up with a light stagger (project grammar).
  // `reduced` disables the transform/blur, keeping an opacity-only settle.
  const hidden = reduced
    ? { opacity: 0 }
    : { opacity: 0, y: 22, filter: "blur(10px)" }
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" }
  const reveal = (delay = 0) => ({
    initial: hidden,
    animate: shown,
    transition: { duration: reduced ? 0 : 0.7, ease: LUXURY_EASE, delay },
  })

  return (
    <section id={`galeri-${category.slug}`} className="flex flex-col">
      {/* Category header — mirrors the storefront hero grammar. Keyed on the
          slug: React remounts on category switch, so the mount reveal always
          plays (no AnimatePresence exit window → the header NEVER blanks).
          Each child carries EXPLICIT initial/animate — no variant-name
          propagation that can silently leave content hidden.
          Counts live ABOVE the grid (after the nav), not here. */}
      <div className="container m-auto w-full">
        <motion.header
          key={category.slug}
          className="mx-auto flex max-w-4xl flex-col items-center gap-6 pt-16 pb-8 text-center md:gap-8 md:pt-20 md:pb-13"
        >
          <motion.p
            {...reveal()}
            className="flex items-center gap-3.5 text-[11px] tracking-[0.34em] text-primary uppercase"
          >
            <span
              aria-hidden="true"
              className="h-px w-8 bg-primary/60 sm:w-10"
            />
            <span>Galeri Perayaan</span>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-primary/60 sm:w-10"
            />
          </motion.p>
          <motion.h1
            {...reveal(0.06)}
            className="font-heading text-[clamp(46px,7vw,92px)] leading-[0.95] font-light tracking-[-0.02em] text-foreground"
          >
            Galeri{" "}
            <span className="font-accent text-primary italic">
              {category.label == "Semua" ? "Nusantara" : category.label}
            </span>
          </motion.h1>
          {category.description && (
            <motion.p
              {...reveal(0.12)}
              className="max-w-2xl text-base text-muted-foreground md:text-lg"
            >
              {category.description}
            </motion.p>
          )}
        </motion.header>
      </div>

      {/* Category navigation — slug-driven, moves page state. */}
      <GalleryFilterBar
        activeSlug={category.slug}
        onSelect={(slugTo) => navigate(`/galeri/${slugTo}`)}
      />

      <div className="container m-auto w-full pt-8 pb-24 md:pt-10 md:pb-32">
        <GalleryGrid
          items={items}
          isLoading={query.isLoading}
          isError={query.isError}
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          onLoadMore={query.fetchNextPage}
          onRetry={() => query.refetch()}
          onReset={() => navigate("/galeri")}
        />
      </div>
    </section>
  )
}

export default GaleriCategoryBlock
