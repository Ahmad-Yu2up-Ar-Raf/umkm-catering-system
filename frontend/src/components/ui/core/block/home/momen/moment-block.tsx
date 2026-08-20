"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { MotionConfig, motion } from "framer-motion"

import { useGaleriPreviews } from "@/services/galeri/use-galeri-query"
import { useImageModalStore } from "@/store/image-modal-store"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import {
  AUTO_ADVANCE_MS,
  toMomentItem,
  type MomentItem,
} from "./moment-data"
import { MomentFeatured } from "./components/moment-featured"
import { MomentMarquee } from "./components/moment-marquee"
import { MomentHeader } from "./components/moment-header"

/** Luxury ease — premium Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/**
 * MomentSkeleton — 1:1 placeholder for the loaded two-part layout.
 *
 * Mirrors the exact dimensions of the loaded state so the swap to live data
 * causes ZERO layout shift: the featured frame keeps its aspect-ratio/height
 * box and the marquee strip keeps its tile sizes + vertical rhythm (`mt-3`
 * / `py-2`).
 */
function MomentSkeleton() {
  return (
    <>
      <div className="aspect-[3/2] w-full overflow-hidden rounded-2xl sm:aspect-[2/1] lg:aspect-auto lg:h-[min(50vh,520px)]">
        <Skeleton className="h-full w-full rounded-2xl" />
      </div>
      <div className="mt-3 flex gap-3 overflow-hidden py-2" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton
            key={i}
            className="aspect-[4/3] w-[170px] shrink-0 rounded-2xl sm:w-[190px]"
          />
        ))}
      </div>
    </>
  )
}

/**
 * #momentum — "Momen Yang Kami Rayakan" (Tiska gallery replica).
 *
 * Two-part layout (verified DOM, NOT masonry):
 *   1. Featured — large rounded crossfade display (own GSAP timeline per
 *      frame: overlapping crossfade + ken-burns settle + caption stagger).
 *   2. Marquee — infinite thumbnail strip (CSS `animate-marquee`, continuous
 *      loop, gradient fade masks on both edges).
 *
 * Reveal choreography — SEQUENTIAL, never one grouped blur (owner request):
 *   1. Header  — eyebrow + H2 word-blur reveal (shared `BlurReveal`).
 *   2. CTA     — "Lihat galeri lengkap" link, delayed just after the header.
 *   3. Card    — the Featured display, a light fade+rise, own in-view trigger.
 *   4. Marquee — the tiles stagger in LAST (`staggerChildren`).
 *
 * Performance — "moment device freeze" fix:
 *  - NO GSAP/ScrollTrigger on this block at all. All reveals are declarative
 *    Framer transitions over transform/opacity only (compositor-friendly),
 *    so the main thread only does work the instant an element enters.
 *  - The featured crossfade/ken-burns keeps its own tiny GSAP timeline (the
 *    interactive carousel); everything around it is declaration-driven.
 *  - `MotionConfig reducedMotion="user"` → all reveals render instantly.
 */
export function MomentBlock() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Live gallery data — the SHARED storefront fetcher (`useGaleriPreviews`):
  // one request, `featured` = the signature set, preview pools for the rest.
  const { featured, results, isLoading } = useGaleriPreviews()
  const previewItems = useMemo(
    () => results.flatMap((result) => result.data?.items ?? []),
    [results]
  )
  const moments: MomentItem[] = useMemo(() => {
    // Featured flags first (curated moments); fall back to the preview pool.
    const base = featured.length > 0 ? featured : previewItems
    return base.slice(0, 8).map(toMomentItem)
  }, [featured, previewItems])

  const select = useCallback((index: number) => setActiveIndex(index), [])

  // Interactive trigger — every moment card/image opens the GLOBAL lightbox.
  const openMoment = useCallback(
    (index: number) => {
      useImageModalStore.getState().open(
        moments.map((moment) => ({
          src: moment.imagePath,
          title: moment.title,
          caption: moment.description,
          category: moment.category,
        })),
        index
      )
    },
    [moments]
  )

  // Auto-advance — continuous; resets on manual tile/pill clicks. Guarded on
  // data — nothing cycles while the query is in flight.
  useEffect(() => {
    if (moments.length < 2) return
    const id = window.setInterval(
      () => setActiveIndex((i) => (i + 1) % moments.length),
      AUTO_ADVANCE_MS
    )
    return () => window.clearInterval(id)
  }, [activeIndex, moments.length])

  // Clamp against data that shrinks between renders (featured → fallback).
  const active = moments.length > 0 ? activeIndex % moments.length : 0

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        id="momentum"
        className="relative overflow-hidden bg-secondary/40 px-0 pb-15 sm:py-15 md:px-10 md:py-20  "
      >
        {/* <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-background)_100%,transparent),transparent_90%)]"
        /> */}

        <div className="relative z-50 container mx-auto w-full">
          {/* 1 + 2 — header (word-blur) and CTA (delayed) animate internally. */}
          <MomentHeader />

          {/* 3 + 4 — skeleton while the query is in flight; once loaded, the
              featured card rises in and the marquee tiles stagger last. All
              cards open the global lightbox. */}
          {isLoading ? (
            <MomentSkeleton />
          ) : moments.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.1 }}
              >
                <MomentFeatured
                  items={moments}
                  activeIndex={active}
                  onSelect={select}
                  onOpen={openMoment}
                />
              </motion.div>

              <MomentMarquee
                items={moments}
                activeIndex={active}
                onSelect={select}
                onOpen={openMoment}
              />
            </>
          ) : null}
        </div>
      </section>
    </MotionConfig>
  )
}
export default MomentBlock
