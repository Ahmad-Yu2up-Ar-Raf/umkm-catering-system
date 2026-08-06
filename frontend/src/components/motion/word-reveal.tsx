import { useRef } from "react"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"

type Word = { text: string; accent: boolean }

/** `Cita Rasa *Rumahan* untuk ...` → "Rumahan" flagged as the italic accent word. */
function parseWords(text: string): Word[] {
  return text.split(" ").map((raw) => {
    const m = /^\*(.+)\*$/.exec(raw)
    return m ? { text: m[1], accent: true } : { text: raw, accent: false }
  })
}

type WordRevealProps = {
  text: string
  className?: string
  delay?: number
  stagger?: number
  duration?: number
  /** Blur radius (px) for the word-by-word blur reveal. When set, words lift
   *  + un-blur (`blur → 0`) instead of the masked slide-up; the `filter` is
   *  cleared (`clearProps`) on completion so no blur layer is retained. */
  blur?: number
  /** Gate: when false the words are pre-hidden (no flash behind the preloader);
   *  flipping true runs the slide-up reveal. Default true. */
  play?: boolean
  /** `"mount"` (default) plays the reveal immediately on mount (hero, gated by
   *  `play`). `"scroll"` pre-hides the words and plays them once, scroll-triggered
   *  at `scrollStart` — for below-the-fold sections like #kontak. */
  trigger?: "mount" | "scroll"
  /** ScrollTrigger start for `trigger="scroll"` (default "top 80%"). */
  scrollStart?: string
}

/**
 * Masked word-reveal (design.md §10.1 #1). Renders an inline span of words,
 * each inside an `overflow-hidden` mask; GSAP lifts inner spans from
 * translateY(110%) → 0 with stagger. Accent words (`*word*`) get the
 * Merriweather italic accent treatment (design.md §10.1 #2).
 *
 * With `blur` set, the mask wrapper is dropped (blurred letters must not be
 * clipped) and each word animates `opacity 0→1, y 20→0, filter blur(--)→0`
 * with `power3.out` — the "word-by-word blur" grain. `clearProps: "filter"`
 * drops the filter after the tween to keep the layer GPU-light.
 *
 * `play` lets the caller hold the words hidden until after the preloader has
 * finished, so the reveal always happens on-screen — never behind the curtain.
 * `trigger="scroll"` instead plays the reveal once when the element scrolls
 * into view (for sections below the fold, where a mount-time reveal would be
 * over before the user ever sees it).
 */
export function WordReveal({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  duration = 0.9,
  play = true,
  blur,
  trigger = "mount",
  scrollStart = "top 80%",
}: WordRevealProps) {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLSpanElement>(null)
  const words = parseWords(text)

  useGSAP(
    () => {
      if (reduced || !rootRef.current) return
      const targets = rootRef.current.querySelectorAll<HTMLElement>("[data-word]")
      const hidden = blur
        ? { opacity: 0, y: 24, filter: `blur(${blur}px)` }
        : { yPercent: 110 }
      const reveal = blur
        ? {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration,
            delay,
            stagger,
            ease: "power3.out",
            clearProps: "filter",
          }
        : { yPercent: 0, duration, ease: "power3.out", stagger, delay }

      if (trigger === "scroll") {
        // Below-the-fold reveal: pre-hide, then play once on scroll. The words
        // are already gated invisible so nothing flashes before the trigger.
        gsap.set(targets, hidden)
        gsap.fromTo(targets, hidden, {
          ...reveal,
          scrollTrigger: {
            trigger: rootRef.current,
            start: scrollStart,
            once: true,
          },
        })
        return
      }
      if (!play) {
        // Pre-hide behind the preloader — revealed the instant `play` flips.
        gsap.set(targets, hidden)
        return
      }
      gsap.fromTo(targets, hidden, reveal)
    },
    {
      scope: rootRef,
      dependencies: [play, delay, stagger, duration, blur, trigger, scrollStart],
    },
  )

  return (
    <span ref={rootRef} className={className}>
      {words.map((word, index) =>
        // Blur mode: NO overflow-hidden mask (it would clip soft blur edges).
        blur ? (
          <span key={index} className="inline-block">
            <span
              data-word
              className={cn(
                "inline-block will-change-transform",
                word.accent && "font-accent italic text-primary"
              )}
            >
              {word.text}
            </span>
            {index < words.length - 1 ? "\u00A0" : ""}
          </span>
        ) : (
          <span
            key={index}
            className="inline-block overflow-hidden px-2 pb-[0.12em] -mb-[0.12em] align-bottom"
          >
            <span
              data-word
              className={cn(
                "inline-block",
                word.accent && "font-accent italic text-primary"
              )}
            >
              {word.text}
            </span>
            {index < words.length - 1 ? " " : null}
          </span>
        )
      )}
    </span>
  )
}
