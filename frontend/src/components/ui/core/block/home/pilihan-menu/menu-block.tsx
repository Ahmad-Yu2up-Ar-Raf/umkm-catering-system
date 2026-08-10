"use client"

import { useCallback, useRef, useState } from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight } from "@hugeicons/core-free-icons"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { OriginButton } from "@/components/ui/fragments/custom-ui/button/cta-button"
import { AUTO_ADVANCE_MS, MENU_CHOICES } from "./menu-data"
import { MenuHeader } from "./components/menu-header"
import { MenuList } from "./components/menu-list"
import { MenuGallery } from "./components/menu-gallery"

/** Luxury ease — premium Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as unknown as gsap.EaseString

/**
 * #pilihan-menu — auto-advancing tab list (left) + synced visual display
 * (right). Structural replica of the Tiska catering reference section.
 *
 * Motion architecture (GSAP, one signature moment = the 6s ken-burns sweep):
 *  - SCHEDULER (this block): one GSAP timeline per active tab owns the
 *    progress hairline (scaleX 0→1 over AUTO_ADVANCE_MS) AND the auto-advance
 *    `.call()` at the end. Manual clicks bump `cycleSeed` so a same-tab click
 *    still restarts the timer. Old timelines are killed first → aggressive
 *    spam-click never stacks a second `.call()`.
 *  - ENTRANCE (ScrollTrigger, once): header fades up → the 7 list rows reveal
 *    one-by-one (stagger 0.15, y 20) → the gallery glides in last — a single
 *    continuous chain, mirroring the FAQ accordion's staggered cascade.
 *  - GALLERY (child): its own timeline crossfades photos and staggers the
 *    caption. `prefers-reduced-motion` → static active frame only.
 *
 * Container/padding mirrors the About/FAQ sections (`container` = px-5
 * md:px-0, max-w-4xl); mobile CTA sits at the very bottom of the section.
 */
export function PilihanMenuBlock() {
  const sectionRef = useRef<HTMLElement>(null)
  const carouselRef = useRef<gsap.core.Timeline | null>(null)
  const reduced = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [cycleSeed, setCycleSeed] = useState(0)

  const selectMenu = useCallback((next: number) => {
    setActiveIndex(next)
    setCycleSeed((s) => s + 1)
  }, [])

  // Auto-advance scheduler — one timeline per tab.
  useGSAP(
    () => {
      if (reduced || !sectionRef.current) return

      const progress = sectionRef.current.querySelector<HTMLElement>(
        "[data-menu-progress]"
      )
      if (!progress) return

      // Kill any pending advance so a manual click never double-fires.
      carouselRef.current?.kill()

      const tl = gsap.timeline()
      tl.fromTo(
        progress,
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left center",
          duration: AUTO_ADVANCE_MS / 1000,
          ease: "none",
        }
      ).call(
        () => setActiveIndex((prev) => (prev + 1) % MENU_CHOICES.length),
        undefined,
        AUTO_ADVANCE_MS / 1000
      )

      carouselRef.current = tl
    },
    { scope: sectionRef, dependencies: [activeIndex, cycleSeed, reduced] }
  )

  // Scroll-triggered entrance — one continuous cascade: header → menu rows
  // (one-by-one) → gallery. Same grammar as the FAQ accordion reveal.
  useGSAP(
    () => {
      const el = sectionRef.current
      if (!el) return

      const q = gsap.utils.selector(el)
      const header = q("[data-menu-header]")
      const rows = q("[data-menu-item]")
      const gallery = q("[data-menu-gallery]")

      if (reduced) {
        // End state only — nothing animates, everything fully visible.
        gsap.set([...header, ...rows, ...gallery], { autoAlpha: 1, y: 0 })
        return
      }

      // Pre-hide EVERYTHING (header + rows + gallery) to the same start state
      // so nothing flashes as the section scrolls in. One uniform origin for
      // the whole cascade — no element ever enters at a different height.
      gsap.set([...header, ...rows, ...gallery], { autoAlpha: 0, y: 30 })

      gsap
        .timeline({
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            once: true,
          },
        })
        // Header leads the chain.
        .fromTo(
          header,
          { y: 30, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, ease: LUXURY_EASE },
          0
        )
        // List rows UNFOLD top→bottom like an accordion: one-by-one, a
        // generous 0.15s breathing gap between rows (power2.out = soft ease-in).
        .fromTo(
          rows,
          { y: 30, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.15,
          },
          0.15
        )
        // Gallery enters CONCURRENTLY with the FIRST list row (same label
        // position) — it never waits for the list to finish. The two columns
        // reveal together, like one unit.
        .fromTo(
          gallery,
          { y: 30, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.85, ease: "power2.out" },
          0.15
        )
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="pilihan-menu"
      className="relative overflow-hidden pb-20   md:py-30"
    >
      {/* Soft warm halo above — token-driven (background light, never raw color). */}
      {/* <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-background)_85%,transparent),transparent_85%)]"
      /> */}

      <div className="relative z-30 container flex flex-col justify-center md:gap-4">
        <div data-menu-header>
          <MenuHeader />
        </div>

        {/* Grid — exact 12-col trait replica, MD swaps order via md:order-*.
            Both columns stretch to the same row height (grid default); the
            gallery's `md:min-h` sets a balanced floor for the pair. */}
        <div className="grid gap-6 md:grid-cols-12 md:items-stretch md:gap-12">
          <div
            data-menu-gallery
            className="md:order-2 md:col-span-5 md:pl-5 lg:col-span-6"
          >
            <MenuGallery activeIndex={activeIndex} />
          </div>
          <div className="md:order-1 md:col-span-7 lg:col-span-6">
            <MenuList activeIndex={activeIndex} onSelect={selectMenu} />
          </div>
        </div>

        {/* Mobile CTA — at the very bottom of the section, always reachable
            after scrolling the menu list. Hidden on md+ (header owns it). */}
        <div className="mt-9 flex justify-center md:hidden">
          <OriginButton
            intensity={0.8}
            range={120}
            className="group border border-primary/40 bg-muted text-xs tracking-widest uppercase sm:border-2 sm:border-primary sm:bg-transparent"
          >
            Lihat Menu Lengkap
            <HugeiconsIcon
              icon={ArrowRight}
              className="z-[9] size-4 fill-none transition-transform duration-700 ease-out group-hover:translate-x-1"
            />
          </OriginButton>
        </div>
      </div>
    </section>
  )
}
