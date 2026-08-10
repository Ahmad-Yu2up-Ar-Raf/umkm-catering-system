"use client"

import { useRef } from "react"

import { MotionConfig } from "framer-motion"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { MengapaGrid } from "./mengapa-grid"
import { MengapaHeader } from "./mengapa-header"

/** Luxury ease — premium Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as unknown as gsap.EaseString

/**
 * #mengapa — "Mengapa Memilih Nusantara" (stats band).
 *
 * Layout: flex header (H2 left / description right, both animated by the
 * shared `BlurReveal` primitives) + a fully BORDERLESS 4-cell grid.
 * Background matches the #testimoni band (`bg-secondary/60` + warm radial
 * glow) for a smooth section boundary.
 *
 * Motion (`prefers-reduced-motion` → static):
 *  - Header reveal is owned by `BlurReveal` (word-blur) inside the section;
 *    `MotionConfig reducedMotion="user"` makes those render instantly.
 *  - Entrance: the 4 cells cascade in (y + opacity stagger, once).
 *  - Per-cell 0 → value count-up fires via each card's own ScrollTrigger
 *    (`start: top 85%`) as the cells reveal.
 */
export function MengapaBlock() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = sectionRef.current
      if (!el) return

      // The header is animated by BlurReveal — only the cards cascade here.
      const cards = gsap.utils.selector(el)("[data-mengapa-card]")

      if (reduced) {
        gsap.set(cards, { autoAlpha: 1, y: 0 })
        return
      }

      // Pre-hide so nothing flashes as the section scrolls in.
      gsap.set(cards, { autoAlpha: 0, y: 28 })

      gsap
        .timeline({
          scrollTrigger: { trigger: el, start: "top 75%", once: true },
        })
        .fromTo(
          cards,
          { y: 28, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: LUXURY_EASE,
            stagger: 0.09,
          },
          0
        )
    },
    { scope: sectionRef }
  )

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        id="mengapa"
        className="relative overflow-hidden bg-secondary/60   py-20 md:py-20"
      >
        {/* Warm glow from the top — token-driven, never a raw color. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-background)_100%,transparent),transparent_90%)]"
        />

        <div className="relative container mx-auto p-0">
          <div data-mengapa-header>
            <MengapaHeader />
          </div>

          <MengapaGrid />
        </div>
      </section>
    </MotionConfig>
  )
}

export default MengapaBlock
