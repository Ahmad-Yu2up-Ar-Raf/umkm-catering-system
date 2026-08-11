import { useEffect, useRef, useState } from "react"

import { useLenis } from "lenis/react"
import { useLocation } from "react-router"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { ScrollTrigger } from "@/components/motion/gsap"
import { cn } from "@/lib/utils"
import { usePreloaderStore } from "@/store/preloader-store"
import { teleportToHash } from "@/lib/hash-scroll"
import { HeroBlock } from "@/components/ui/core/block/home/hero/hero-block"
import { Preloader } from "@/components/motion/preloader"
import AboutBlock from "@/components/ui/core/block/home/about/about-block"
import { MengapaBlock } from "@/components/ui/core/block/home/mengapa/mengapa-block"
import { FaqsSection } from "@/components/ui/core/block/home/faq/faq-block"
import OrderingBlock from "@/components/ui/core/block/home/ordering/ordering-block"
import { PilihanMenuBlock } from "@/components/ui/core/block/home/pilihan-menu/menu-block"
import TestimonialBlock from "@/components/ui/core/block/home/testimonial/testimonial-block"
import { MomentBlock } from "@/components/ui/core/block/home/momen/moment-block"

const PRELOADER_FLAG = "hasSeenPreloader"

/**
 * Max rAF retries (≈2s) waiting for the pinned `#cara-pesan` layout to settle
 * before a cross-route hash teleport. After this the mask is revealed without
 * jumping rather than teleporting into a half-built layout.
 */
const MAX_SETTLE_ATTEMPTS = 120

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
    // and would fight the reset. Then re-measure every ScrollTrigger after the
    // lock is released.
    const hash = location.hash
    if (!hash || hash === "#") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [preloaderDone, location.hash])

  // Broadcast preloader state to the layout chrome (header + footer): while a
  // preloader is playing → `done: false` (chrome hidden), when the curtain
  // reaches 100% → `done: true` (hero + chrome mount together).
  useEffect(() => {
    usePreloaderStore.getState().setDone(preloaderDone)
  }, [preloaderDone])

  // Align to a `#section` hash ONLY once GSAP's layout is GUARANTEED stable —
  // the pinned #cara-pesan section reserves ~3000px of document height via its
  // `.pin-spacer`. Until that spacer's height EXISTS IN THE DOM and stops
  // changing between frames, every section AFTER it (#testimoni, #faq) is still
  // at its PRE-pin document position — measuring now would teleport into the
  // pin and strand the viewport inside it. Sequence:
  //   1. POLL (with a forced `ScrollTrigger.refresh()` each retry) until the
  //      spacer height is applied and stable across 2 consecutive frames.
  //   2. TELEPORT via the shared `teleportToHash` (force-refresh → disarm →
  //      instant Lenis jump → re-arm).
  //   3. REVEAL the landing mask.
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
    // (The header's same-page clicks use `pushState`, never a React Router
    // hash change, so they never re-enter this effect.)
    if (!preloaderDone) return

    const hash = location.hash
    const listenTarget = document.querySelector<HTMLElement>(hash)

    const revealMask = () => {
      maskRef.current?.classList.replace("opacity-100", "opacity-0")
      window.setTimeout(() => setIsMaskVisible(false), 500)
    }

    if (!listenTarget) {
      // Section didn't render (defensive): reveal the page anyway.
      revealMask()
      return
    }

    setIsMaskVisible(true)

    let cancelled = false
    let attempts = 0
    let prevSpacerHeight = -1
    let stableFrames = 0

    const tryTeleport = () => {
      if (cancelled) return

      // Desktop PINS #cara-pesan; mobile + reduced-motion render it static
      // (no `.pin-spacer` at all), so there is nothing to wait for.
      const pinEnabled = window.matchMedia("(min-width: 768px)").matches
      const pinnedExpected = pinEnabled && !reduced

      // Read the spacer's APPLIED height (a forced layout read — the only way
      // to know GSAP actually reserved the pin travel in the DOM).
      const spacerHeight =
        document.querySelector<HTMLElement>(".pin-spacer")?.offsetHeight ?? -1
      if (spacerHeight === prevSpacerHeight && spacerHeight > 100) {
        stableFrames++
      } else {
        stableFrames = 0
      }
      prevSpacerHeight = spacerHeight

      const settled = !pinnedExpected || stableFrames >= 2

      if (!settled && attempts < MAX_SETTLE_ATTEMPTS) {
        attempts++
        // Force GSAP to measure the shifting layout on every retry, so the
        // spacer height converges instead of stalling.
        ScrollTrigger.refresh()
        requestAnimationFrame(tryTeleport)
        return
      }

      if (!settled) {
        // Give up gracefully rather than teleporting into a half-built layout.
        revealMask()
        return
      }

      // Layout is stable — teleport (force-refresh → disarm → jump → re-arm)
      // and fade the mask.
      teleportToHash(hash, lenis)
      revealMask()
    }

    requestAnimationFrame(tryTeleport)

    return () => {
      cancelled = true
      // Safety: re-enable everything if we unmount mid-bypass.
      ScrollTrigger.getAll().forEach((st) => st.enable())
    }
  }, [preloaderDone, location.hash, lenis, reduced])

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
