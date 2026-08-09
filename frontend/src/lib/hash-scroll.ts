import { ScrollTrigger } from "@/components/motion/gsap"

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
 *  - short standard sections get exact vertical centering.
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
  return isTallOrPinned ? -96 : -((viewportHeight - height) / 2)
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
