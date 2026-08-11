"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { MotionConfig, motion } from "framer-motion"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { useGaleriQuery } from "@/services/galeri/use-galeri-query"

import { AUTO_ADVANCE_MS, FEATURED_ITEMS } from "./galeri-data"
import type { GalleryItem } from "./types/gallery-types"
import { GalleryHero } from "./components/gallery-hero"
import { GalleryFeatured } from "./components/gallery-featured"
import { GalleryFilterBar } from "./components/gallery-filter-bar"
import { GalleryRails } from "./components/gallery-rails"
import { GalleryGrid } from "./components/gallery-grid"
import { GalleryLightbox } from "./components/gallery-lightbox"
import { useGalleryParams } from "./hooks/use-gallery-params"

/** Luxury ease — premium Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/**
 * Galeri Perayaan — the public gallery (sitemap /galeri).
 *
 * Composition: editorial hero → featured signature crossfade (warm secondary
 * wash band) → sticky category filter bar (`?kategori=` URL-driven) → rails
 * ("Semua") or grid (single category) → fullscreen lightbox.
 *
 * Motion: ONE GSAP reveal on the hero only (same grammar as /paket). The
 * featured crossfade owns its own tiny GSAP timeline (interactive carousel);
 * everything else is declarative Framer transitions over transform/opacity.
 * `MotionConfig reducedMotion="user"` → all declarative reveals render
 * instantly; the featured timeline falls back to a static active frame.
 *
 * Lightbox scope = the set the user clicked from (featured or visible list);
 * the featured auto-advance is PAUSED while the lightbox is open.
 */
export function GalleryBlock() {
  const headerRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { kategori, setKategori } = useGalleryParams()
  const query = useGaleriQuery()

  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [lightbox, setLightbox] = useState<{
    items: GalleryItem[]
    index: number
  } | null>(null)

  const items = query.data ?? []
  const visibleItems = kategori
    ? items.filter((item) => item.category === kategori)
    : items

  const openFrom = useCallback((scope: GalleryItem[], index: number) => {
    setLightbox({ items: scope, index })
  }, [])

  // Hero reveal — the page's one GSAP moment (matches /paket grammar).
  useGSAP(
    () => {
      const el = headerRef.current
      if (!el) return

      const targets = gsap.utils.selector(el)("[data-gallery-reveal]")

      if (reduced) {
        gsap.set(targets, { autoAlpha: 1, y: 0 })
        return
      }

      gsap.set(targets, { autoAlpha: 0, y: 24 })
      gsap.to(targets, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
      })
    },
    { scope: headerRef }
  )

  // Featured auto-advance — continuous; resets on manual selection, and is
  // paused while the lightbox is open (never advances behind the viewer).
  useEffect(() => {
    if (lightbox) return
    const id = window.setInterval(
      () => setFeaturedIndex((i) => (i + 1) % FEATURED_ITEMS.length),
      AUTO_ADVANCE_MS
    )
    return () => window.clearInterval(id)
  }, [lightbox, featuredIndex])

  return (
    <MotionConfig reducedMotion="user">
      <section id="galeri" className="flex flex-col">
        {/* 1 — editorial hero (one GSAP reveal). */}
        <div ref={headerRef} className="container m-auto w-full">
          <GalleryHero />
        </div>

        {/* 2 — featured signature event, on the warm secondary wash band. */}
        <div className="bg-secondary/60">
          <div className="container m-auto w-full py-10 md:py-14">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.1 }}
            >
              <GalleryFeatured
                items={FEATURED_ITEMS}
                activeIndex={featuredIndex}
                onSelect={setFeaturedIndex}
                onExpand={(index) => openFrom(FEATURED_ITEMS, index)}
              />
            </motion.div>
          </div>
        </div>

        {/* 3 — sticky category pill bar (URL-driven). */}
        <GalleryFilterBar
          kategori={kategori}
          count={visibleItems.length}
          onKategoriChange={setKategori}
        />

        {/* 4 — showcase: cluster rails ("Semua") or a filtered grid. */}
        <div className="container m-auto w-full pt-10 pb-24 md:pt-14 md:pb-32">
          {kategori ? (
            <GalleryGrid
              items={visibleItems}
              isLoading={query.isLoading}
              isError={query.isError}
              onRetry={() => query.refetch()}
              onReset={() => setKategori("")}
              onSelect={(index) => openFrom(visibleItems, index)}
            />
          ) : (
            <GalleryRails
              items={visibleItems}
              onSelect={(index) => openFrom(visibleItems, index)}
            />
          )}
        </div>

        {/* 5 — fullscreen lightbox, scoped to the clicked set. */}
        {lightbox && (
          <GalleryLightbox
            items={lightbox.items}
            index={lightbox.index}
            onIndexChange={(index) =>
              setLightbox((lb) => (lb ? { ...lb, index } : lb))
            }
            onClose={() => setLightbox(null)}
          />
        )}
      </section>
    </MotionConfig>
  )
}

export default GalleryBlock
