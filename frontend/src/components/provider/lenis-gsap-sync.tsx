"use client"

import { useEffect } from "react"
import { useLenis } from "lenis/react"

import { gsap, ScrollTrigger } from "@/components/motion/gsap"
import { usePreloaderStore } from "@/store/preloader-store"

/**
 * STEP 1 pin-magnet fix (rebuilt Phase 8): the canonical Lenis ↔ ScrollTrigger
 * sync, running ONLY after the preloader lifts.
 *
 * BEFORE (broken): `<ReactLenis root>` ran its own rAF loop with ScrollTrigger
 * learning scroll position a frame late (native scroll events only). Every
 * scrubbed animation — worst the 3000px `#cara-pesan` pin — lagged then
 * caught up: the rubber-band / "gleb" snap at pin entry/exit.
 *
 * AFTER: GSAP's ticker drives Lenis (`lenis.raf`), and every Lenis scroll
 * notifies ScrollTrigger synchronously. Scrub positions are exact per frame,
 * so the pin engages/releases with zero catch-up jump. `lagSmoothing(0)` is
 * the Lenis-documented companion (no GSAP time-correction fighting Lenis).
 *
 * STEP 2 isolation: the sync mounts only once `preloaderDone` flips, so the
 * preloader timeline runs with zero GSAP/Lenis contention. First-visit
 * desktop: sync activates at curtain lift, exactly when the scroll lock
 * releases (the home two-frame gate re-measures triggers there). Repeat
 * visits, mobile, and preloader-less routes start with `done: true`, so the
 * sync is active from first paint.
 *
 * No global refresh() lives here: the Preloader's font gate guarantees
 * webfonts settle BEFORE the curtain lifts, so trigger measurements taken
 * after the lift already use final font metrics.
 *
 * Cleanup is complete (ticker removed, listener off) so route remounts never
 * stack duplicate drivers — the transition-lag class of bug.
 */
export function LenisGsapSync() {
  const lenis = useLenis()
  const preloaderDone = usePreloaderStore((s) => s.done)

  useEffect(() => {
    if (!lenis || !preloaderDone) return
    const onScroll = (): void => {
      ScrollTrigger.update()
    }
    lenis.on("scroll", onScroll)
    const tick = (time: number): void => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.off("scroll", onScroll)
    }
  }, [lenis, preloaderDone])

  return null
}
