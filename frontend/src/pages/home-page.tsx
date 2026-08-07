import { useEffect, useState } from "react"

import { useLenis } from "lenis/react"
import { useLocation } from "react-router"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { ScrollTrigger } from "@/components/motion/gsap"
import { cn } from "@/lib/utils"
import { usePreloaderStore } from "@/store/preloader-store"
import { HeroBlock } from "@/components/ui/core/block/home/hero/hero-block"
import { Preloader } from "@/components/motion/preloader"
import AboutBlock from "@/components/ui/core/block/home/about/about-block"
import { FaqsSection } from "@/components/ui/core/block/home/faq/faq-block"
import OrderingBlock from "@/components/ui/core/block/home/ordering/ordering-block"
import TestimonialBlock from "@/components/ui/core/block/home/testimonial/testimonial-block"

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
    if (!preloaderDone) return
    const hash = location.hash
    if (!hash || hash === "#") return
    const targetEl = document.querySelector<HTMLElement>(hash)
    if (!targetEl) return

    let cancelled = false
    let attempts = 0

    // Step 1 — disarm every ScrollTrigger so the pin can't hijack the jump.
    // `disable(false)` keeps their current values (no premature reset).
    const triggers = ScrollTrigger.getAll()
    triggers.forEach((st) => st.disable(false))

    const tryTeleport = () => {
      if (cancelled) return
      // Step 2 — the OrderingBlock's pin-spacer (~+3000px) must exist, proving
      // the heavy GSAP layout is mounted and the document height is real.
      // (Reduced motion creates no pin, so skip straight to the teleport.)
      const hasPinSpacer = !!document.querySelector(".pin-spacer")
      if (!hasPinSpacer && !reduced && attempts < 50) {
        attempts++
        requestAnimationFrame(tryTeleport)
        return
      }

      // Step 3 — instant teleport straight to the element (Lenis element API).
      if (lenis) {
        lenis.scrollTo(targetEl, {
          immediate: true,
          force: true,
          lock: true,
          offset: -96,
        })
      } else {
        targetEl.scrollIntoView({ behavior: "instant", block: "center" })
      }

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
  }, [preloaderDone, location, lenis, reduced])

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
          <TestimonialBlock />
          <OrderingBlock />
          <FaqsSection />
        </main>
      </div>
    </>
  )
}

export default HomePage
