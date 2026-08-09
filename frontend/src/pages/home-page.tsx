import { useEffect, useRef, useState } from "react"

import { useLenis } from "lenis/react"
import { useLocation } from "react-router"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { ScrollTrigger } from "@/components/motion/gsap"
import { cn } from "@/lib/utils"
import { usePreloaderStore } from "@/store/preloader-store"
import {
  resetOrderingTimeline,
  resolveScrollTarget,
  sectionScrollOffset,
} from "@/lib/hash-scroll"
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

  // Align to a `#section` hash after the layout is GUARANTEED stable — and
  // bypass GSAP's aggressive pin interception. The #cara-pesan pinned timeline
  // (~+3000px) treats an instant deep jump as out-of-bounds and snaps the
  // scroll back to its active pin start (≈ #tentang-kami). Sequence:
  //   1. DISABLE all ScrollTriggers so no pin can fight the incoming jump.
  //   2. POLL until the `.pin-spacer` exists (heavy layout injected/stable).
  //   3. TELEPORT straight to the element via Lenis (no manual Y math).
  //   4. RE-ENABLE + refresh so pins rebind to the new viewport position.
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMaskVisible(true)

    const hash = location.hash
    const listenTarget = document.querySelector<HTMLElement>(hash)
    if (!listenTarget) {
      // Section didn't render (defensive): reveal the page anyway.
      maskRef.current?.classList.replace("opacity-100", "opacity-0")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      window.setTimeout(() => setIsMaskVisible(false), 500)
      return
    }

    let cancelled = false
    let attempts = 0

    // Step 1 — disarm every ScrollTrigger so the pin can't hijack the jump.
    // `disable(false)` keeps their current values (no premature reset).
    const triggers = ScrollTrigger.getAll()
    triggers.forEach((st) => st.disable(false))

    const tryTeleport = () => {
      if (cancelled) return
      // Step 2 — on DESKTOP the OrderingBlock's pin-spacer (~+3000px) must exist
      // (proves the heavy GSAP layout is mounted / the document height real).
      // On mobile the ordering section is unpinned (nothing to wait for) and
      // reduced motion creates no pin, so skip straight to the teleport.
      const pinEnabled = window.matchMedia("(min-width: 768px)").matches
      const hasPinSpacer = !!document.querySelector(".pin-spacer")
      if (!hasPinSpacer && !reduced && pinEnabled && attempts < 50) {
        attempts++
        requestAnimationFrame(tryTeleport)
        return
      }

      // Step 3 — align. Pinned/tall targets (≥85% viewport, #cara-pesan) TOP
      // align below the fixed header; short standard sections (faq, testimoni)
      // get exact vertical centering. #cara-pesan lands on the SPACER top.
      const scrollTarget = resolveScrollTarget(listenTarget)
      const offset = sectionScrollOffset(scrollTarget, listenTarget)
      if (lenis) {
        lenis.scrollTo(scrollTarget, {
          immediate: true,
          force: true,
          lock: true,
          offset,
        })
      } else {
        scrollTarget.scrollIntoView({ behavior: "instant", block: "center" })
      }
      // Snap the scrubbed ordering timeline to 0 when landing on the pin, so a
      // jump from below never reverse-scrubs Step 07 → 01.
      if (listenTarget.id === "cara-pesan") {
        resetOrderingTimeline(listenTarget)
      }

      // Fade the mask, then unmount it completely.
      maskRef.current?.classList.replace("opacity-100", "opacity-0")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      window.setTimeout(() => setIsMaskVisible(false), 500)

      // Step 4 — re-arm the triggers and rebind them to the new position.
      requestAnimationFrame(() => {
        if (cancelled) return
        ScrollTrigger.getAll().forEach((st) => st.enable())
        ScrollTrigger.refresh()
      })
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
