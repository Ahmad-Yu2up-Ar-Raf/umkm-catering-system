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
  /** Gate: when false the words are pre-hidden (no flash behind the preloader);
   *  flipping true runs the slide-up reveal. Default true. */
  play?: boolean
}

/**
 * Masked word-reveal (design.md §10.1 #1). Renders an inline span of words,
 * each inside an `overflow-hidden` mask; GSAP lifts inner spans from
 * translateY(110%) → 0 with stagger. Accent words (`*word*`) get the
 * Merriweather italic accent treatment (design.md §10.1 #2).
 *
 * `play` lets the caller hold the words hidden until after the preloader has
 * finished, so the reveal always happens on-screen — never behind the curtain.
 */
export function WordReveal({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  duration = 0.9,
  play = true,
}: WordRevealProps) {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLSpanElement>(null)
  const words = parseWords(text)

  useGSAP(
    () => {
      if (reduced || !rootRef.current) return
      const targets = rootRef.current.querySelectorAll<HTMLElement>("[data-word]")
      if (play) {
        gsap.fromTo(
          targets,
          { yPercent: 110 },
          { yPercent: 0, duration, ease: "power3.out", stagger, delay },
        )
      } else {
        // Pre-hide behind the preloader — revealed the instant `play` flips.
        gsap.set(targets, { yPercent: 110 })
      }
    },
    { scope: rootRef, dependencies: [play, delay, stagger, duration] },
  )

  return (
    <span ref={rootRef} className={className}>
      {words.map((word, index) => (
        <span
          key={index}
          className="inline-block overflow-hidden px-2 pb-[0.12em] -mb-[0.12em] align-bottom"
        >
          <span
            data-word
            className={cn("inline-block", word.accent && "font-accent italic text-primary")}
          >
            {word.text}
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  )
}
