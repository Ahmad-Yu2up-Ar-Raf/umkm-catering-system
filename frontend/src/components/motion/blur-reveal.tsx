"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import type { ElementType, ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Luxury ease — premium Apple-like cubic-bezier. */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/**
 * One word performs the blur-reveal and cleans up after itself:
 * `willChange` during the tween, `filter` removed on completion so the
 * browser never keeps a blur layer alive (performance rule).
 */
function BlurWord({
  children,
  className,
  delay,
  duration,
  stagger,
  blur,
  scale,
  onMount,
  amount,
}: {
  children: ReactNode
  className?: string
  delay: number
  duration: number
  stagger: number
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
      transition={{ duration, ease: LUXURY_EASE, delay: delay + stagger }}
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
 * - `children` as a string → split into words, each lifting + un-blurring
 *   sequentially (left → right).
 * - Non-text content → pass a single element as `children` for a blur-fade.
 *
 * Every animated word is `will-change: transform, filter, opacity` during the
 * tween and has its `filter` (and `will-change`) removed on completion.
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

  return (
    <Comp className={className}>
      {words ? (
        words.map((word, i) => (
          <BlurWord
            key={`${word}-${i}`}
            className={wordClassName}
            delay={delay}
            duration={duration}
            stagger={i * stagger}
            blur={blur}
            scale={scale}
            onMount={onMount}
            amount={amount}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </BlurWord>
        ))
      ) : (
        <BlurWord
          className={wordClassName}
          delay={delay}
          duration={duration}
          stagger={0}
          blur={blur}
          scale={scale}
          onMount={onMount}
          amount={amount}
        >
          {children}
        </BlurWord>
      )}
    </Comp>
  )
}
