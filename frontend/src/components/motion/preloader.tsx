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
 * Cinematic curtain preloader (design.md §10.1 #6, HOMEPAGE_BUILD §5).
 * One GSAP timeline:
 *   static editorial eyebrow → word-mask title reveal (power3.out) →
 *   center-out light-streak (scaleX 0→1, transform-origin center) →
 *   deliberate pause → title + streak exit first → curtain lifts (expo.inOut).
 *
 * Portaled into document.body at z-[9999] so no ancestor stacking context
 * (transform/filter/will-change: transform) can trap or clip the fixed curtain.
 * `onComplete` fires only when the final curtain-lift tween finishes — the
 * parent uses it to persist the run-once flag and release the hero timeline.
 * Skipped entirely under `prefers-reduced-motion`.
 */
export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const streakRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      if (reduced || !rootRef.current) return

      const words = rootRef.current.querySelectorAll<HTMLElement>("[data-pw]")
      const tl = gsap.timeline()

      tl.fromTo(
        words,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, stagger: 0.05, ease: "power3.out" },
        0.5
      )
        .fromTo(
          streakRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.8,
            transformOrigin: "center",
            ease: "power2.inOut",
          },
          1.3
        )
        // Luxurious pause — let the type and light breathe before exiting.
        .to(
          titleRef.current,
          { y: -48, autoAlpha: 0, duration: 0.6, ease: "power2.in" },
          "+=1.2"
        )
        .to(
          streakRef.current,
          { autoAlpha: 0, duration: 0.35, ease: "power1.out" },
          "<"
        )
        // Curtain lifts to reveal the site underneath — then hand control to the parent.
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
      <div className="flex w-full flex-col items-center gap-12 px-6 pb-24 text-center">
        {/* Static editorial eyebrow — deliberately never animated. */}
        <p className="font-heading text-xs tracking-[0.45em] text-primary uppercase">
          SEJAK 2024 · BOGOR
        </p>

        {/* Word-mask title — one amber italic accent (brand exception, design.md §11). */}
        <h2
          ref={titleRef}
          className="font-heading text-[clamp(32px,6vw,64px)] leading-[1.08] font-light text-balance text-foreground"
        >
          {TITLE_LINES.map((line, lineIndex) => (
            <span key={lineIndex} className="block">
              {line.map((word, wordIndex) => (
                <span
                  key={wordIndex}
                  className="-mb-[0.12em] inline-block overflow-hidden px-2 pb-[0.12em] align-bottom  "
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

        {/* Center-out editorial light-streak (gradient hairline, amber core). */}
        <span
          ref={streakRef}
          className="block h-px w-40 bg-gradient-to-r from-transparent via-primary/60 to-transparent sm:w-72"
        />
      </div>
    </div>,
    document.body
  )
}
