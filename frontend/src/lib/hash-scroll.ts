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
 *  If a GSAP `.pin-spacer` wraps the target (legacy pin architecture),
 *  scrolling to the SPACER's top enters at the natural start; otherwise the
 *  element itself (e.g. `#cara-pesan` now lives on the outer sticky wrapper,
 *  whose top IS the story start). */
function resolveScrollTarget(targetEl: HTMLElement): HTMLElement {
  return targetEl.closest<HTMLElement>(".pin-spacer") ?? targetEl
}

/**
 * Resolve once every image rendered ABOVE `target` has decoded (or the
 * timeout elapses, whichever first). Only above-target images can push the
 * target down — awaiting below-fold lazy images would hang until scrolled
 * to, so they are excluded by measurement. Uses addEventListener (never
 * clobbers img.onload), resolves broken images via the error path, and
 * treats already-decode-complete images as settled.
 */
export function waitForImagesAbove(
  target: HTMLElement,
  timeoutMs = 1200
): Promise<void> {
  const targetTop =
    target.getBoundingClientRect().top + window.scrollY
  const pending: Promise<void>[] = []
  for (const img of Array.from(document.images)) {
    const imgTop = img.getBoundingClientRect().top + window.scrollY
    if (imgTop >= targetTop) continue
    if (img.complete && img.naturalWidth > 0) continue
    pending.push(
      new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true })
        img.addEventListener("error", () => resolve(), { once: true })
      })
    )
  }
  if (pending.length === 0) return Promise.resolve()
  return Promise.race([
    Promise.all(pending).then(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs)),
  ])
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

  // gsap-performance batching rule: ALL reads first, then ALL writes — never
  // interleave. Both reads below are layout queries; no style write may run
  // between them or the browser is forced into a synchronous reflow (the PSI
  // "Forced synchronous layout" warning). The single write (scrollTo) follows.
  // Callers must invoke this only after layout is stable (home two-frame gate:
  // refresh → lenis.resize → here; same-page: DOM already settled).
  const scrollY = window.scrollY
  const rectTop = scrollTarget.getBoundingClientRect().top

  // Absolute destination. `rect.top + scrollY` is the element's document
  // position — it holds at ANY current scroll, so the jump cannot land short
  // of the pin's reserved travel no matter how far the page is scrolled.
  const destination = rectTop + scrollY + HEADER_OFFSET

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
