"use client"

import { useEffect, useState } from "react"

import { MotionConfig, motion } from "framer-motion"

import { useGaleriPreviews } from "@/services/galeri/use-galeri-query"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import { useImageModalStore } from "@/store/image-modal-store"
import { useGaleriStore } from "@/store/galeri-store"

import { AUTO_ADVANCE_MS } from "./galeri-data"
import { GalleryHero } from "./components/gallery-hero"
import { GalleryFeatured } from "./components/gallery-featured"
import { GalleryCategorySection } from "./components/gallery-category-section"

/** Luxury ease — premium Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/** Loading skeleton for the storefront's category rails. */
function RailsSkeleton() {
  return (
    <div className="flex flex-col gap-16 md:gap-20">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex flex-col gap-5">
          <div className="flex items-baseline justify-between gap-2">
            <Skeleton className="h-7 w-40 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
          </div>
          <div className="flex gap-3">
            {Array.from({ length: 4 }, (_, j) => (
              <Skeleton
                key={j}
                className="aspect-[16/10] basis-[72%] shrink-0 rounded-2xl sm:basis-[40%] md:basis-[30%] lg:basis-[24%]"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Galeri Perayaan — the public gallery STOREFRONT (sitemap /galeri).
 *
 * Curated discovery, NOT a dataset browser: editorial hero → signature
 * featured crossfade → one horizontal preview rail per category, each with a
 * "Lihat Semua" CTA that deep-links into `/galeri/:kategori` (where the
 * heavy infinite-scroll masonry lives). Data is LIGHTWEIGHT — every rail is a
 * dedicated 8-item preview query, never a 500-item dump.
 *
 * Chrome gate: flips `useGaleriStore.ready` once the preview queries settle
 * so `LayoutWrapper` defers the CTA band + footer past the loading skeleton.
 */
export function GalleryBlock() {
  const { categories, results, featured, isLoading, isError } = useGaleriPreviews()
  const isModalOpen = useImageModalStore((s) => s.isOpen)

  const [featuredIndex, setFeaturedIndex] = useState(0)

  const previewsSettled = !isLoading && !isError

  // Chrome gate — CTA + footer render only after the storefront has loaded.
  useEffect(() => {
    useGaleriStore.getState().setReady(previewsSettled)
  }, [previewsSettled])

  // Featured auto-advance — continuous; paused while the global image modal
  // is open (never advances behind the viewer).
  useEffect(() => {
    if (isModalOpen || featured.length < 2) return
    const id = window.setInterval(
      () => setFeaturedIndex((i) => (i + 1) % featured.length),
      AUTO_ADVANCE_MS
    )
    return () => window.clearInterval(id)
  }, [isModalOpen, featured.length])

  return (
    <MotionConfig reducedMotion="user">
      <section id="galeri" className="flex flex-col">
        {/* 1 — editorial hero (self-contained reveal). */}
        <div className="container m-auto w-full">
          <GalleryHero />
        </div>

        {/* 2 — featured signature event (premium viewport reveal: blur +
            fade-up, once, fast — the first piece below the hero). */}
        <div className="container m-auto w-full pt-6   pb-8 md:pt-8  ">
          {isLoading ? (
            <Skeleton className="aspect-[3/2] w-full rounded-2xl sm:aspect-[2/1] lg:h-[min(50vh,520px)]" />
          ) : (
            featured.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, ease: LUXURY_EASE, delay: 0.1 }}
              >
                <GalleryFeatured
                  items={featured}
                  activeIndex={featuredIndex % featured.length}
                  onSelect={setFeaturedIndex}
                />
              </motion.div>
            )
          )}
        </div>

        {/* 3 — category previews: one editorial rail per category. */}
        <div className="container m-auto w-full pt-12 pb-24 md:pt-16 md:pb-32">
          {previewsSettled ? (
            <div className="flex flex-col gap-16 md:gap-20">
              {results.map((result, index) => {
                const category = categories[index]
                if (!category) return null
                return (
                  <GalleryCategorySection
                    key={category.slug}
                    category={category}
                    items={result.data?.items ?? []}
                    isLoading={result.isLoading}
                  />
                )
              })}
            </div>
          ) : (
            <RailsSkeleton />
          )}
        </div>
      </section>
    </MotionConfig>
  )
}

export default GalleryBlock
