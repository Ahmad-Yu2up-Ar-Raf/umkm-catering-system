import { useEffect, useState } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { ScrollTrigger } from "@/components/motion/gsap"
import { cn } from "@/lib/utils"
import { usePreloaderStore } from "@/store/preloader-store"
import { HeroBlock } from "@/components/ui/core/block/home/hero/hero-block"
import { Preloader } from "@/components/motion/preloader"
import AboutBlock from "@/components/ui/core/block/home/about/about-block"
import { FaqsSection } from "@/components/ui/core/block/home/faq/faq-block"
import ContactBlock from "@/components/ui/core/block/home/contact/contact-block"

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
  // Reduced motion → skip the curtain AND never lock scroll; it also means the
  // preloader never calls `onComplete`, so the gate must start "done".
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
    // then re-measure every ScrollTrigger after the lock is released.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [preloaderDone])

  // Broadcast preloader state to the layout chrome (header + footer): while a
  // preloader is playing → `done: false` (chrome hidden), when the curtain
  // reaches 100% → `done: true` (hero + chrome mount together).
  useEffect(() => {
    usePreloaderStore.getState().setDone(preloaderDone)
  }, [preloaderDone])

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
          <FaqsSection />

        </main>
      </div>
    </>
  )
}

export default HomePage
