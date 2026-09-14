"use client"

import { useRef } from "react"
import { motion, type Variants } from "framer-motion"
import type { ElementType, ReactNode } from "react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

/** Luxury ease — premium Apple-like cubic-bezier. */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

// Module-scope motion wrappers (stable identity — never created in render).
// Only `span` and `p` are used as container tags across the app; anything
// else falls back to `span` (same inline layout, zero visual delta).
const MotionSpan = motion.create("span")
const MotionP = motion.create("p")

/**
 * Single-element blur-fade (non-text children): ONE motion node, ONE blur
 * layer, `willChange` + `filter` removed on completion so the browser never
 * keeps a blur layer alive (performance rule).
 */
function BlurWord({
  children,
  className,
  delay,
  duration,
  blur,
  scale,
  onMount,
  amount,
}: {
  children: ReactNode
  className?: string
  delay: number
  duration: number
  blur: number
  /** Starting scale (default 1 = none). Pass < 1 for a subtle scale-up (CTA). */
  scale: number
  onMount: boolean
  amount: number
}) {
  const ref = useRef<HTMLSpanElement>(null)

  const base = {
    opacity: 0,
    y: 15,
    scale,
    filter: `blur(${blur}px)`,
  }
  const target = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }

  return (
    <motion.span
      ref={ref}
      className={cn(
        "inline-block will-change-[transform,filter,opacity]",
        className
      )}
      initial={base}
      {...(onMount
        ? { animate: target }
        : { whileInView: target, viewport: { once: true, amount } })}
      transition={{ duration, ease: LUXURY_EASE, delay }}
      onAnimationComplete={() => {
        // Drop the filter (and will-change) so no blur layer is retained.
        ref.current?.style.removeProperty("filter")
        ref.current?.style.removeProperty("will-change")
      }}
    >
      {children}
    </motion.span>
  )
}

type BlurRevealProps = {
  children: ReactNode
  /** Renders the container element as this tag (default `span`). */
  as?: ElementType
  className?: string
  wordClassName?: string
  delay?: number
  /** Stagger between words (default 0.06s). */
  stagger?: number
  duration?: number
  /** Blur radius at the start (default 8px). */
  blur?: number
  /** Starting scale (default 1 = none). Pass < 1 for a subtle scale-up CTA. */
  scale?: number
  /** Animate on mount (menus, dialogs) instead of scroll-into-view. */
  onMount?: boolean
  amount?: number
}

/**
 * Global word-by-word blur reveal — "the Tiska grain", high performance.
 *
 * - `children` as a string → words lift + fade individually (left → right,
 *   `staggerChildren`) while a SINGLE `filter: blur()` tween runs on the
 *   container. One blur layer per reveal instead of one per word: on a
 *   12-word headline this collapses 12 concurrent paint-chain filters into 1,
 *   which is what froze capable hardware during the hero mount storm.
 * - Non-text content → single-element blur-fade (one layer, unchanged).
 *
 * The container's `filter` (and `will-change`) is removed on completion.
 * `prefers-reduced-motion` is handled by the app-level `MotionConfig`.
 */
export function BlurReveal({
  children,
  as: Comp = "span",
  className,
  wordClassName,
  delay = 0,
  stagger = 0.06,
  duration = 0.6,
  blur = 8,
  scale = 1,
  onMount = false,
  amount = 0.2,
}: BlurRevealProps) {
  const words = typeof children === "string" ? children.split(" ") : null
  // Cap the blur radius ONCE per reveal — ≤4px on phones where blur layers
  // are most expensive; desktop keeps the full grain.
  const isMobile = useIsMobile()
  const radius = isMobile ? Math.min(blur, 4) : blur
  const containerRef = useRef<HTMLElement | null>(null)
  const MotionComp = Comp === "p" ? MotionP : MotionSpan
  // Ref callback typed on `unknown` so it satisfies either wrapper's ref
  // (span or p) without an `any` cast — it only stores for style cleanup.
  const setContainerRef = (el: unknown) => {
    containerRef.current = el as HTMLElement | null
  }

  if (!words) {
    return (
      <Comp className={className}>
        <BlurWord
          className={wordClassName}
          delay={delay}
          duration={duration}
          blur={radius}
          scale={scale}
          onMount={onMount}
          amount={amount}
        >
          {children}
        </BlurWord>
      </Comp>
    )
  }

  // The blur lifts across the whole word sequence so every word visibly
  // un-blurs as it arrives (same read as the old per-word filters).
  const sequence = delay + stagger * (words.length - 1) + duration
  const container: Variants = {    hidden: { filter: `blur(${radius}px)` },
    show: {
      filter: "blur(0px)",
      transition: { duration: sequence, ease: LUXURY_EASE, delay },
    },
  }
  const word: Variants = {
    hidden: { opacity: 0, y: 15, scale },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration,
        ease: LUXURY_EASE,
        delay: delay + i * stagger,
      },
    }),
  }

  return (
    <MotionComp
      ref={setContainerRef}
      className={cn(className, "will-change-[filter]")}
      variants={container}
      initial="hidden"
      {...(onMount
        ? { animate: "show" }
        : { whileInView: "show", viewport: { once: true, amount } })}
      onAnimationComplete={() => {
        const el = containerRef.current
        el?.style.removeProperty("filter")
        el?.style.removeProperty("will-change")
      }}
    >
      {words.map((wordText, i) => (
        <motion.span
          key={`${wordText}-${i}`}
          className={cn("inline-block", wordClassName)}
          variants={word}
          custom={i}
        >
          {wordText}
          {i < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </MotionComp>
  )
}
