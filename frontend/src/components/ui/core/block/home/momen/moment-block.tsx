"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { MotionConfig, motion } from "framer-motion"

import { AUTO_ADVANCE_MS, MOMENT_ITEMS } from "./moment-data"
import { MomentFeatured } from "./components/moment-featured"
import { MomentMarquee } from "./components/moment-marquee"
import { MomentHeader } from "./components/moment-header"

/** Luxury ease — premium Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

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

  const select = useCallback((index: number) => setActiveIndex(index), [])

  // Auto-advance — continuous; resets on manual tile/pill clicks.
  useEffect(() => {
    const id = window.setInterval(
      () => setActiveIndex((i) => (i + 1) % MOMENT_ITEMS.length),
      AUTO_ADVANCE_MS
    )
    return () => window.clearInterval(id)
  }, [activeIndex])

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        id="momentum"
        className="relative overflow-hidden px-0 pb-15 sm:py-15 md:px-10 md:py-20 lg:pt-5"
      >
        <div className="relative z-50 container mx-auto w-full">
          {/* 1 + 2 — header (word-blur) and CTA (delayed) animate internally. */}
          <MomentHeader />

          {/* 3 — the featured card rises in after the header. */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.1 }}
          >
            <MomentFeatured activeIndex={activeIndex} onSelect={select} />
          </motion.div>

          {/* 4 — the marquee tiles stagger in last (internal staggerChildren). */}
          <MomentMarquee activeIndex={activeIndex} onSelect={select} />
        </div>
      </section>
    </MotionConfig>
  )
}

export default MomentBlock
