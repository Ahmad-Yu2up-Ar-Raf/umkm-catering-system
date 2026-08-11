import { ScrollTrigger } from "@/components/motion/gsap"
import type Lenis from "lenis"

/**
 * Hash-landing scroll helpers shared by the header's same-page jumps and the
 * homepage's cross-route mount teleport — one source of truth so the pinned
 * `#cara-pesan` behavior and the centering math never drift apart.
 */

/** The element Lenis should actually scroll TO for a `#section` target.
 *  Pinned sections (#cara-pesan) live inside a `.pin-spacer`; once the page has
 *  scrolled past the pin, the section's OWN rect sits at the END of the spacer
 *  (the post-timeline position = step 07). Targeting the SPACER top = step 01.
 */
export function resolveScrollTarget(targetEl: HTMLElement): HTMLElement {
  return targetEl.closest<HTMLElement>(".pin-spacer") ?? targetEl
}

/** Instant-landing scroll offset:
 *  - pinned / tall targets (≥85% of the viewport, or #cara-pesan) TOP-align
 *    below the fixed header — centering a pin/tall element scrolls into its
 *    timeline or buries its content.
 *  - short standard sections: center them ONLY when no pin exists. When the
 *    pinned `#cara-pesan` section is on the page, centering a sibling that
 *    follows it (e.g. #testimoni) would land the viewport INSIDE the pin's
 *    reserved travel (the `.pin-spacer` bottom), where GSAP keeps the ordering
 *    pin active — the "gets stuck on #cara-pesan" bug. Top-align below the
 *    header instead: safe for every section.
 */
export function sectionScrollOffset(
  scrollTarget: HTMLElement,
  targetEl: HTMLElement
): number {
  const viewportHeight = window.innerHeight
  const height = scrollTarget.getBoundingClientRect().height
  const pinned = scrollTarget.classList.contains("pin-spacer")
  const isTallOrPinned =
    pinned || height >= viewportHeight * 0.85 || targetEl.id === "cara-pesan"
  if (isTallOrPinned) return -96

  const hasPin = document.querySelector(".pin-spacer") !== null
  return hasPin ? -96 : -((viewportHeight - height) / 2)
}

/** After an instant jump to #cara-pesan, force its scrubbed timeline to
 *  literal zero so a teleport FROM BELOW never reverse-scrubs Step 07 → 01
 *  (the "flash rewind"). Safe no-op when the pin isn't mounted (mobile /
 *  reduced motion).
 */
export function resetOrderingTimeline(targetEl: HTMLElement): void {
  const trigger = ScrollTrigger.getAll().find((st) => st.trigger === targetEl)
  if (!trigger?.animation) return
  trigger.animation.progress(0, false)
}

/** Re-entrancy guard — a second hash click while the first teleport's pins are
 *  still being re-armed races Lenis/GSAP and strands the viewport (repeated
 *  clicks landing on the wrong section). Released synchronously: every call is
 *  otherwise self-contained, so this only blocks true double-invocations.
 */
let teleportInFlight = false

/**
 * Instant, pin-safe teleport to a `#hash` section — the SINGLE code path used
 * by both the header's same-page jumps and the homepage's cross-route landing:
 *   0. FORCE SYNC: `ScrollTrigger.refresh()` the CURRENT layout BEFORE any
 *      measurement — pin positions/rects carry over stale from previous states.
 *   1. DISARM every ScrollTrigger, so the pinned #cara-pesan can't fight the
 *      jump — an instant deep scroll past an active pin makes GSAP re-assert on
 *      the next tick and snap the viewport back to the pin's boundary (the
 *      "lands on #cara-pesan" bug).
 *   2. Resolve the pin-aware target + offset and scroll via Lenis (instant).
 *   3. Re-ARM + re-measure on the next frame, once the jump has landed.
 * Returns false when the section doesn't exist (caller reveals the page anyway)
 * or when another teleport is still in flight.
 */
export function teleportToHash(hash: string, lenis?: Lenis | null): boolean {
  if (teleportInFlight) return false
  teleportInFlight = true

  // Force sync BEFORE any offset math.
  ScrollTrigger.refresh()

  const targetEl = document.querySelector<HTMLElement>(hash)
  if (!targetEl) {
    teleportInFlight = false
    return false
  }

  const triggers = ScrollTrigger.getAll()
  triggers.forEach((st) => st.disable(false))

  const scrollTarget = resolveScrollTarget(targetEl)
  const offset = sectionScrollOffset(scrollTarget, targetEl)
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
  if (targetEl.id === "cara-pesan") {
    resetOrderingTimeline(targetEl)
  }

  requestAnimationFrame(() => {
    triggers.forEach((st) => st.enable())
    ScrollTrigger.refresh()
  })
  teleportInFlight = false
  return true
}
