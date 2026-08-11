import { ScrollTrigger } from "@/components/motion/gsap"
import type Lenis from "lenis"

/**
 * Hash-landing scroll helper shared by the header's same-page jumps and the
 * homepage's cross-route mount teleport — one source of truth.
 *
 * The destination is computed HERE from the LIVE bounding box and LIVE native
 * scroll (`getBoundingClientRect().top + window.scrollY`) and passed to Lenis
 * as a NUMBER. This is deliberate: element targets make Lenis resolve
 * `rect.top + its own animatedScroll`, which can lag the native scroll right
 * after a `ScrollTrigger.refresh()` adjusted the viewport for an inflated pin
 * spacer — the jump lands short by the spacer delta, inside the pin. A numeric
 * destination is scroll-position-independent and deterministic.
 */

/** Fixed-header clearance — every section top-aligns just below the pill. */
const HEADER_OFFSET = -96

/** The element Lenis should actually scroll TO for a `#section` target.
 *  A pinned section (#cara-pesan) lives inside a `.pin-spacer`; scrolling to
 *  the SPACER's top enters the pin at step 01 (its natural start), while the
 *  section's own rect only resolves after the pin has fully released. */
function resolveScrollTarget(targetEl: HTMLElement): HTMLElement {
  return targetEl.closest<HTMLElement>(".pin-spacer") ?? targetEl
}

/**
 * Instant, pin-safe scroll to a `#hash` section.
 *
 * The caller decides whether the layout needs measuring:
 *   - cross-route: `ScrollTrigger.refresh()` + `lenis.resize()` ONCE after
 *     hydration, then call (see home-page's two-frame gate).
 *   - same-page: DOM is already stable — call directly, no refresh.
 *
 * Returns false when the section doesn't exist in the DOM.
 */
export function scrollToHash(hash: string, lenis?: Lenis | null): boolean {
  const targetEl = document.querySelector<HTMLElement>(hash)
  if (!targetEl) return false

  const scrollTarget = resolveScrollTarget(targetEl)

  // Absolute destination. `rect.top + scrollY` is the element's document
  // position — it holds at ANY current scroll, so the jump cannot land short
  // of the pin's reserved travel no matter how far the page is scrolled.
  const destination =
    scrollTarget.getBoundingClientRect().top + window.scrollY + HEADER_OFFSET

  if (lenis) {
    // NUMBER target → Lenis skips element rect resolution entirely (no stale
    // `animatedScroll` math) and applies no offset (it's baked in above).
    lenis.scrollTo(destination, {
      immediate: true,
      force: true,
    })
  } else {
    // Fallback when Lenis isn't mounted (defensive) — same destination.
    window.scrollTo({ top: destination, behavior: "instant" })
  }

  // Re-sync ScrollTrigger to the new scroll position so no pin/timeline is a
  // frame behind the jump.
  ScrollTrigger.update()

  return true
}
