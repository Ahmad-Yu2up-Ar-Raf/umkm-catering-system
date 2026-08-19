"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router"

import { ArrowRight } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useAnimationFrame, useMotionValue, type Variants } from "framer-motion"

import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

import type { GalleryCategory } from "../types/gallery-types"
import type { GalleryItem } from "../types/gallery-types"
import { GalleryCard } from "./gallery-card"

/** Premium ease — Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/**
 * Coordinated scroll reveal: heading/CTA first, marquee content after.
 * Elegant blur + fade-up, once per section as it enters the viewport.
 * `MotionConfig reducedMotion="user"` (storefront root) collapses the
 * transform/filter to a plain opacity fade automatically.
 */
const sectionVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: LUXURY_EASE },
  },
}

/** Marquee velocity — deliberately SLOW & chill (px/sec). At 35px/s a full
 *  pass of an 8-card strip takes well over a minute: relaxed, never rushed. */
const MARQUEE_SPEED = 35

/**
 * GalleryMarquee — one infinite, smooth, slow rail.
 *
 * Architecture: a DOUBLED track (items × 2) translated at constant velocity
 * via `useAnimationFrame` + a single `useMotionValue`. When the offset crosses
 * ± half the track width it wraps by that amount → a seamless, continuous
 * loop (same seam mathematics as the house `--animate-marquee` token, but
 * driven by JS so dragging can own the same value).
 *
 *  - Autoplay: slow, linear, never snapping.
 *  - Pause on hover: hover sets a `paused` flag; the frame loop stops driving
 *    the value, which freezes in place and resumes on leave (constant-
 *    velocity resume, no jump).
 *  - Drag/swipe: pointer capture scrubs the SAME `x` motion value while
 *    dragging (play paused during the gesture) and resumes on release.
 *  - Direction: `ltr` = track moves left, `rtl` = moves right — alternating
 *    sections zig-zag across the storefront.
 *  - Edge fade: `mask-image` gradient on both extremes (house pattern).
 *  - `prefers-reduced-motion` → static single list, no movement, no drag
 *    (`MotionConfig reducedMotion="user"` already wraps the storefront).
 */
function GalleryMarquee({
  items,
  direction = "ltr",
}: {
  items: GalleryItem[]
  direction?: "ltr" | "rtl"
}) {
  const reduced = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)

  const [halfWidth, setHalfWidth] = useState(0)
  const pausedRef = useRef(false)
  const draggingRef = useRef(false)
  const lastXRef = useRef(0)

  // Half point = one full copy of the doubled track. Measured once mounted +
  // on resize; the seam stays exact because the strip is `w-max` with uniform
  // `mr-3` per card.
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => setHalfWidth(Math.max(el.scrollWidth / 2, 1))
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  // Continuous slow motion — paused while hovered or actively dragging.
  useAnimationFrame((_, delta) => {
    if (reduced) return
    if (pausedRef.current) return
    const dt = Math.min(delta, 64) / 1000
    const sign = direction === "rtl" ? 1 : -1
    let v = x.get() + sign * MARQUEE_SPEED * dt
    if (halfWidth > 0) {
      if (v <= -halfWidth) v += halfWidth
      if (v >= halfWidth) v -= halfWidth
    }
    x.set(v)
  })

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (reduced) return
      if (e.pointerType === "mouse" && e.button !== 0) return
      draggingRef.current = true
      pausedRef.current = true
      lastXRef.current = e.clientX
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [reduced]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return
      const dx = e.clientX - lastXRef.current
      lastXRef.current = e.clientX
      // Scrub the SAME motion value the loop drives — autoplay and drag never
      // fight; on release the loop continues from wherever the user left it.
      let v = x.get() - dx // drag right → content moves right (rtl feel)
      if (halfWidth > 0) {
        if (v <= -halfWidth) v += halfWidth
        if (v >= halfWidth) v -= halfWidth
      }
      x.set(v)
    },
    [x, halfWidth]
  )

  const endDrag = useCallback(() => {
    draggingRef.current = false
    pausedRef.current = false
  }, [])

  // A full copy of the strip — the track = copy A + copy B (aria-hidden) so
  // translateX wraps at exactly half the width. Lowercase helper (returns
  // JSX, is NOT a component) so `react-hooks/static-components` stays happy.
  const cards = (hidden: boolean) => (
    <div className="flex shrink-0" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <GalleryCardWrapper
          key={`${item.id}-${hidden ? "b" : "a"}`}
          item={item}
          index={i}
          scope={items}
        />
      ))}
    </div>
  )

  // Reduced motion ⇒ one static copy, no movement.
  const loop = !reduced && items.length > 0

  return (
    <div
      aria-label="Pratinjau momen per kategori"
      className="overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]"
    >
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => {
          if (loop) pausedRef.current = true
        }}
        onMouseLeave={() => {
          if (!draggingRef.current) pausedRef.current = false
        }}
        className="group/gallery-marquee cursor-grab touch-pan-y select-none active:cursor-grabbing"
      >
        <motion.div
          style={{ x }}
          className={cn("flex w-max", loop && "will-change-transform")}
        >
          {cards(false)}
          {loop && cards(true)}
        </motion.div>
      </div>
    </div>
  )
}

/** Sized card wrapper — one card, uniform `mr-3` spacing on the strip. */
function GalleryCardWrapper({
  item,
  index,
  scope,
}: {
  item: GalleryItem
  index: number
  scope: GalleryItem[]
}) {
  return (
    <div className="mr-3 shrink-0">
      <GalleryCard
        item={item}
        index={index}
        scope={scope}
        className="aspect-[16/10] w-[72vw] max-w-[300px] sm:w-[280px] md:w-[300px] lg:w-[320px]"
      />
    </div>
  )
}

/**
 * GalleryCategorySection — one editorial MARQUEE rail on the storefront.
 *
 * Heading (category label) → "Lihat Semua" CTA deep-linking into
 * `/galeri/:slug` → a continuous, slow, infinite marquee of the PREVIEW items
 * with edge fades, hover-pause, and pointer drag/swipe. No Prev/Next buttons.
 * `direction` lets alternating sections zig-zag (row 1 → ltr, row 2 → rtl, …).
 * The lightbox scope = this rail's real items only, in display order. Reveals
 * when the section enters the viewport (once — no re-animation on scroll).
 */
export function GalleryCategorySection({
  category,
  items,
  isLoading,
  direction = "ltr",
}: {
  category: GalleryCategory
  items: GalleryItem[]
  isLoading: boolean
  direction?: "ltr" | "rtl"
}) {
  const headingId = `galeri-rail-${category.slug}`

  return (
    <motion.section
      aria-labelledby={headingId}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={sectionVariants}
    >
      <motion.div
        variants={lineVariants}
        className="mb-5 flex flex-wrap items-baseline justify-between gap-2"
      >
        <h2
          id={headingId}
          className="font-heading text-[clamp(20px,2.6vw,28px)] leading-tight font-light tracking-[-0.01em] text-foreground"
        >
          {category.label}
        </h2>

        <Link
          to={`/galeri/${category.slug}`}
          className={cn(
            "group inline-flex items-center gap-1.5 text-[11px] tracking-[0.22em] text-primary uppercase",
            "transition-colors duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          )}
        >
          Lihat Semua
          <HugeiconsIcon
            icon={ArrowRight}
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </motion.div>

      <motion.div variants={lineVariants}>
        {isLoading ? (
          <div className="flex gap-3">
            {Array.from({ length: 4 }, (_, j) => (
              <Skeleton
                key={j}
                className="aspect-[16/10] w-[240px] shrink-0 rounded-2xl sm:w-[280px]"
              />
            ))}
          </div>
        ) : items.length === 0 ? null : (
          <GalleryMarquee items={items} direction={direction} />
        )}
      </motion.div>
    </motion.section>
  )
}

export default GalleryCategorySection