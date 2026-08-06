import { useRef } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"

/* Hallmark · pre-emit critique: P4 H4 E4 S4 R4 V4 */

type Word = { text: string; accent: boolean }

const TITLE_LINES: Word[][] = [
  [
    { text: "Cita", accent: false },
    { text: "Rasa", accent: false },
    { text: "Rumahan", accent: true },
  ],
  [
    { text: "Untuk", accent: false },
    { text: "Perayaan", accent: false },
    { text: "Istimewa", accent: false },
  ],
]

/**
 * Cinematic curtain preloader — a strict luxury GSAP sequence:
 *   1. Eyebrow (fade + slide up)  →  2. word-mask title  →  3. light-streak
 *   → luxurious pause  →  all exit together  →  curtain lifts (expo.inOut).
 *
 * Typography is a 1:1 mirror of the Hero section (FIX 5): same eyebrow
 * hairline–label–hairline composition + exact display classes & gaps.
 *
 * The parent home-page scroll-locks the body while this is mounted and only
 * releases when `onComplete` fires (curtain exit at 100%). Portaled into
 * document.body at z-[9999] so no ancestor stacking context traps the curtain.
 * Skipped entirely under `prefers-reduced-motion`.
 */
export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const streakRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      if (reduced || !rootRef.current) return

      const words = rootRef.current.querySelectorAll<HTMLElement>("[data-pw]")
      // Eyebrow hairlines — BOTH expand width 0 → 100% in perfect sync (one
      // tween over both targets, no stagger = the exact same millisecond),
      // mirroring outward from the label on the same beat as the eyebrow fade.
      const hairlines = rootRef.current.querySelectorAll<HTMLElement>(
        "[data-eyebrow-line]"
      )
      if (hairlines.length === 2) {
        gsap.set(hairlines[0], { transformOrigin: "right center" })
        gsap.set(hairlines[1], { transformOrigin: "left center" })
      }

      // Breathing room: 0.4s settle beat before anything appears.
      const tl = gsap.timeline({ delay: 0.4 })

      // 1. Eyebrow — relaxed, elegant fade + gentle rise (opacity 0 → 1, y 10 → 0).
      //    A full 1s so the hairline–label–hairline reads calmly, never rushed.
      tl.fromTo(
        eyebrowRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" },
        0
      )
        // 1b. Hairlines expand in lockstep with the eyebrow fade (same beat).
        .fromTo(
          hairlines,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.0, ease: "power2.out" },
          0
        )
        // 2. Main title — masked word reveal (power3.out, staggered).
        .fromTo(
          words,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.9, stagger: 0.05, ease: "power3.out" },
          0.6
        )
        // 3. Silhouette — slow, deliberate center-out light-streak.
        .fromTo(
          streakRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.1,
            transformOrigin: "center",
            ease: "power2.inOut",
          },
          1.55
        )
        // Luxurious pause — let the type and light breathe before exiting.
        // STEP A — Eyebrow exits first (slides up, fades out).
        .to(
          eyebrowRef.current,
          { y: -20, autoAlpha: 0, duration: 0.6, ease: "power2.in" },
          "+=1.5"
        )
        // STEP B — Main title slides up and fades (slightly higher travel).
        .to(
          titleRef.current,
          { y: -30, autoAlpha: 0, duration: 0.6, ease: "power2.in" },
          "-=0.3"
        )
        // STEP C — Silhouette collapses its width to 0, back to its origin.
        .to(
          streakRef.current,
          { width: 0, autoAlpha: 0, duration: 0.6, ease: "power2.inOut" },
          "-=0.3"
        )
        // STEP D — Curtain lifts (±100%) … then release scroll + fire onComplete.
        .to(
          rootRef.current,
          { yPercent: -100, duration: 1.0, ease: "expo.inOut", onComplete },
          "-=0.15"
        )
    },
    { scope: rootRef }
  )

  if (reduced) return null

  return createPortal(
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-muted"
    >
      <div className="flex w-full flex-col items-center gap-0 px-6 pb-24 text-center">
        {/* Eyebrow — exact Hero composition: hairline — label — hairline. */}
        <div
          ref={eyebrowRef}
          className="relative mb-10 flex w-full max-w-xs items-center gap-4 text-xs tracking-[0.34em] text-primary uppercase sm:max-w-md"
        >
          <div aria-hidden="true" data-eyebrow-line className="h-px w-full flex-1 bg-primary" />
          <p className="flex w-fit flex-col whitespace-nowrap text-[10px] sm:flex-row sm:gap-2 sm:text-xs">
            <span>Sejak 2024</span>
            <span className="hidden sm:inline"> · </span>
            <span>Bogor</span>
          </p>
          <div aria-hidden="true" data-eyebrow-line className="h-px w-full flex-1 bg-primary" />
        </div>

        {/* Word-mask title — compact editorial scale, lightweight. */}
        <h2
          ref={titleRef}
          className="min-w-0 eading-[1.15] font-light tracking-tight text-balance text-foreground text-3xl md:text-4xl lg:text-6xl"
        >
          {TITLE_LINES.map((line, lineIndex) => (
            <span key={lineIndex} className="block">
              {line.map((word, wordIndex) => (
                <span
                  key={wordIndex}
                  className="-mb-[0.12em] inline-block overflow-hidden px-2 pb-[0.12em] align-bottom"
                >
                  <span
                    data-pw
                    className={cn(
                      "inline-block",
                      word.accent && "font-accent text-primary italic"
                    )}
                  >
                    {word.text}
                  </span>
                  {wordIndex < line.length - 1 ? " " : null}
                </span>
              ))}
            </span>
          ))}
        </h2>

        {/* Center-out editorial light-streak (the silhouette). */}
        <span
          ref={streakRef}
          className="mt-14 block h-1 w-40 bg-gradient-to-r from-transparent via-primary/60 to-transparent sm:w-72"
        />
      </div>
    </div>,
    document.body
  )
}
