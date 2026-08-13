import { useEffect, useRef, useState } from "react"

import { useLenis } from "lenis/react"
import { useLocation } from "react-router"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { ScrollTrigger } from "@/components/motion/gsap"
import { cn } from "@/lib/utils"
import { usePreloaderStore } from "@/store/preloader-store"
import { scrollToHash } from "@/lib/hash-scroll"
import { Preloader } from "@/components/motion/preloader"
import { HeroBlock } from "@/components/ui/core/block/home/hero/hero-block"
import AboutBlock from "@/components/ui/core/block/home/about/about-block"
import { MengapaBlock } from "@/components/ui/core/block/home/mengapa/mengapa-block"
import { FaqsSection } from "@/components/ui/core/block/home/faq/faq-block"
import OrderingBlock from "@/components/ui/core/block/home/ordering/ordering-block"
import { PilihanMenuBlock } from "@/components/ui/core/block/home/pilihan-menu/menu-block"
import TestimonialBlock from "@/components/ui/core/block/home/testimonial/testimonial-block"
import { MomentBlock } from "@/components/ui/core/block/home/momen/moment-block"

const PRELOADER_FLAG = "hasSeenPreloader"

/** Run-once-per-session gate — read lazily at mount so a repeat visit never
 *  flashes the curtain (no useEffect, no paint of a preloader that will be skipped). */
function hasSeenPreloader(): boolean {
  try {
    return sessionStorage.getItem(PRELOADER_FLAG) === "1"
  } catch {
    return false // storage unavailable → play the curtain; never break the load
  }
}

function HomePage() {
  const reduced = useReducedMotion()
  const location = useLocation()
  const lenis = useLenis()
  // Preloader gate — run-once-per-session; reduced motion skips the curtain.
  const [preloaderDone, setPreloaderDone] = useState(
    () => hasSeenPreloader() || reduced
  )
  // Landing mask — a full-screen brand-cream overlay that obscures the page
  // ONLY during the initial cross-route hash landing (so the Hero never flashes
  // before the teleport). Visibility is a STATE, cleared once the teleport
  // lands: because it stays cleared, a same-page re-render can never resurrect
  // an opaque mask (a derived value would — that was the "mask trap").
  const [isMaskVisible, setIsMaskVisible] = useState(
    () =>
      typeof window !== "undefined" && !!location.hash && location.hash !== "#"
  )
  const maskRef = useRef<HTMLDivElement>(null)

  // Bulletproof scroll lock: while the preloader is active the page CANNOT
  // scroll — `overflow: hidden` on html+body AND the main content is clipped to
  // `h-screen overflow-hidden` (nothing below the fold is reachable). Both are
  // released only when the curtain's exit reaches 100% (`onComplete`), after
  // which every ScrollTrigger is re-measured (the lock clipped the document).
  useEffect(() => {
    if (!preloaderDone) {
      const html = document.documentElement
      const body = document.body
      const prevHtml = html.style.overflow
      const prevBody = body.style.overflow
      html.style.overflow = "hidden"
      body.style.overflow = "hidden"
      return () => {
        html.style.overflow = prevHtml
        body.style.overflow = prevBody
      }
    }
    // Hard-reset to the very top so the HERO (never the footer) is in frame,
    // UNLESS a `#hash` alignment is pending — that effect owns the viewport
    // (single refresh + jump) and would fight the reset.
    const hash = location.hash
    if (!hash || hash === "#") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      // Re-measure every ScrollTrigger after the lock is released.
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }
  }, [preloaderDone, location.hash])

  // Broadcast preloader state to the layout chrome (header + footer): while a
  // preloader is playing → `done: false` (chrome hidden), when the curtain
  // reaches 100% → `done: true` (hero + chrome mount together).
  useEffect(() => {
    usePreloaderStore.getState().setDone(preloaderDone)
  }, [preloaderDone])

  // Align to a `#section` hash — DETERMINISTIC cross-route landing, gated on
  // a TWO-FRAME settle so the layout is stable before anything is measured:
  //   Frame 1: `ScrollTrigger.refresh()` inflates the pinned #cara-pesan
  //            spacer (+~3000px) and recalibrates every trigger, then
  //            `lenis.resize()` re-syncs Lenis' internal scroll to the native
  //            scroll (refresh may have adjusted it to preserve content) and
  //            recomputes its scroll limit from the now-inflated document.
  //   Frame 2: `scrollToHash` measures the live bounding box and jumps via a
  //            numeric Lenis destination — scroll-independent, so it cannot
  //            land short by the spacer delta and get caught in the pin.
  //   Then: reveal the landing mask.
  // No polling, no repeated refreshes. Same-page header clicks use `pushState`,
  // never a React Router hash change, so they never re-enter this effect (and
  // never trigger a mid-scroll refresh).
  useEffect(() => {
    // No pending hash → nothing to land on; ensure the mask stays gone.
    if (!location.hash || location.hash === "#") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMaskVisible(false)
      return
    }

    // Every pending hash landing runs this sequence unconditionally — cross-
    // route arrivals, back/forward, re-visits — as soon as the preloader's
    // scroll lock is released. Nothing guards it away: a hash MUST teleport.
    if (!preloaderDone) return

    const hash = location.hash
    const revealMask = () => {
      maskRef.current?.classList.replace("opacity-100", "opacity-0")
      window.setTimeout(() => setIsMaskVisible(false), 500)
    }

    // Guard against a section that never rendered (defensive) — reveal the
    // page instead of sitting under an opaque mask.
    if (!document.querySelector(hash)) {
      revealMask()
      return
    }

    // Mask up before the jump so the hero never flashes mid-teleport.
    setIsMaskVisible(true)

    let cancelled = false
    requestAnimationFrame(() => {
      if (cancelled) return
      // Frame 1 — measure the stable layout ONCE and re-sync Lenis.
      ScrollTrigger.refresh()
      lenis?.resize()
      requestAnimationFrame(() => {
        if (cancelled) return
        // Frame 2 — jump (numeric, scroll-independent) and fade the mask.
        scrollToHash(hash, lenis)
        revealMask()
      })
    })

    return () => {
      cancelled = true
    }
  }, [preloaderDone, location.hash, lenis])

  return (
    <>
      {!preloaderDone && (
        <Preloader
          onComplete={() => {
            try {
              sessionStorage.setItem(PRELOADER_FLAG, "1")
            } catch {
              /* no-op */
            }
            setPreloaderDone(true)
          }}
        />
      )}

      {/* Landing mask — while a hash teleport is being prepared, a fixed
          brand-cream overlay hides the page so the Hero never flashes before
          the target section is framed; it fades out once the teleport lands. */}
      {isMaskVisible && preloaderDone && (
        <div
          ref={maskRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[9999] bg-background opacity-100 transition-opacity duration-500"
        />
      )}
      <div
        onTouchMove={(e) => {
          if (!preloaderDone) e.preventDefault()
        }}
        className={cn(
          "flex w-full flex-col",
          !preloaderDone &&
            "fixed inset-0 touch-none overflow-hidden overscroll-none"
        )}
      >
        <main>
          <HeroBlock preloaderDone={preloaderDone} />
          <AboutBlock />
          <MengapaBlock />
          <OrderingBlock />
          <MomentBlock />
          <PilihanMenuBlock />
          <TestimonialBlock />
          <FaqsSection />
        </main>
      </div>
    </>
  )
}

export default HomePage
