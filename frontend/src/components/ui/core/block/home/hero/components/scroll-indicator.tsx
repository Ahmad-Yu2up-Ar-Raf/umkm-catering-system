"use client"

import { useRef } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"

/**
 * Entrance delay — the hero's last element (CTA, delay 0.35×6 + 0.6s duration)
 * settles ≈2.7s after the preloader lifts. The cue fades in just after, so it
 * never competes with the hero choreography.
 */
const ENTRANCE_DELAY = 2.6

/**
 * Premium scroll cue — a pill-shaped track with a bobbing dot, built entirely
 * from raw `div`/`span` elements + Tailwind (no SVG).
 *
 * Motion (GSAP, `prefers-reduced-motion` → hidden entirely) — three tweens,
 * each on its OWN element so nothing fights:
 *  - ENTRANCE (root): fade-blur reveal (`autoAlpha 0→1`, `y 10→0`,
 *    `blur 8→0`) AFTER the hero components have finished loading; the filter
 *    is cleared on completion.
 *  - IDLE (dot): the bullet continuously yoyo-bobs down `y: 10` (1.5s,
 *    sine.inOut, repeat) to invite the user to scroll.
 *  - SCROLL FADE (inner pill): as the hero scrolls out of view (0 → 160px),
 *    the pill scrubs `opacity 1 → 0`, fading back in on return to the top.
 *    `scrub: true` ties the fade 1:1 to the wheel.
 */
export function ScrollIndicator() {
  const rootRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced || !rootRef.current) return

      // ENTRANCE — fade-blur reveal, delayed until the hero is done loading.
      gsap.fromTo(
        rootRef.current,
        { autoAlpha: 0, y: 10, filter: "blur(8px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
          delay: ENTRANCE_DELAY,
          clearProps: "filter",
        }
      )

      // IDLE — the dot drifts down the track, then back.
      gsap.to(dotRef.current, {
        y: 10,
        duration: 1.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      })

      // SCROLL FADE — the pill fades over the hero's first 160px of scroll.
      // Trigger = the hero section (`top top` = scroll 0, `+=160` = 160px).
      const section = rootRef.current.closest("section")
      gsap.fromTo(
        pillRef.current,
        { autoAlpha: 1 },
        {
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=160",
            scrub: true,
          },
        }
      )
    },
    { scope: rootRef }
  )

  if (reduced) return null

  return (
    /* Static positioning shell — GSAP never touches its transform, so the
        Tailwind `-translate-x-1/2` centering is never clobbered. */
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
    >
      <div ref={rootRef}>
        <div
          ref={pillRef}
          className="flex h-[34px] w-[22px] items-start justify-center rounded-full border-2 border-primary bg-muted pt-1.5"
        >
          <span
            ref={dotRef}
            className="block h-1.5 w-1.5 rounded-full bg-primary"
          />
        </div>
      </div>
    </div>
  )
}
