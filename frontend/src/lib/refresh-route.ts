import { ScrollTrigger } from "@/components/motion/gsap"
import type Lenis from "lenis"

/**
 * Central debounced route refresh (perf plan P4).
 *
 * Multiple hosts used to call `ScrollTrigger.refresh()` on their own
 * `setTimeout(…, 100)` after every navigation — each refresh re-measures the
 * whole document (including the inflated `#cara-pesan` pin spacer), so N
 * hosts meant N serialized 100–300 ms layout passes before a hash jump.
 *
 * This helper collapses them into ONE refresh per frame: the first caller
 * arms a rAF, later callers in the same frame are absorbed. `lenis.resize()`
 * rides along so Lenis' internal scroll limit re-syncs to the measured
 * document in the same pass.
 *
 * The homepage's two-frame hash gate (`home-page.tsx`) keeps its own
 * direct `ScrollTrigger.refresh()` — it needs a synchronous measure inside
 * its rAF sequence, not a deferred one.
 */
let pending = false

export function refreshRoute(lenis?: Lenis | null): void {
  if (pending) return
  pending = true
  requestAnimationFrame(() => {
    pending = false
    ScrollTrigger.refresh()
    lenis?.resize()
  })
}
