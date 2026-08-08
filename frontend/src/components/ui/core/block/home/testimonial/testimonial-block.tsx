"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

import { MotionConfig, motion, useInView } from "framer-motion"

import { cn } from "@/lib/utils"

/** Luxury ease — premium Apple-like cubic-bezier (shared project grammar). */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/** Autoplay cadence (ms) — each testimonial takes its turn. */
const AUTOPLAY_MS = 6000

type Testimonial = {
  id: string
  /** Quote text — wrap EXACTLY ONE word in `*asterisks*` for the italic
   *  accent treatment (brand rule: never more than one accent word).
   *  Word counts are normalized (10–12 words each) so the grid-stacked
   *  crossfade never shifts the section height on mobile. */
  quote: string
  author: string
  /** e.g. "Pernikahan · Bogor Timur" */
  event: string
}

/**
 * Placeholder copy sourced from the project's approved blueprint
 * (docs/HOMEPAGE_BUILD.md §S6) — replace with verified client testimonials
 * before launch per design.md §11 gate 46 (honest copy). Quotes are kept to
 * a similar word count (≈11) so all slides wrap to the same line count at
 * every breakpoint.
 */
const TESTIMONIALS: Testimonial[] = [
  {
    id: "pernikahan",
    quote:
      "Untuk pernikahan anak kami, rasanya seperti masakan *rumah* yang hangat dan premium.",
    author: "Bu Sri Rahayu",
    event: "Pernikahan · Bogor Timur",
  },
  {
    id: "nasi-box",
    quote:
      "Ayamnya berasa bumbu rumahan yang *khas* bukan rasa katering yang itu-itu saja.",
    author: "Dimas Prasetyo",
    event: "Nasi Box Kantor · Sentul",
  },
  {
    id: "tumpeng-mini",
    quote:
      "Meski namanya mini, kualitasnya tetap *premium* dan otentik khas Nusantara.",
    author: "Maya Anggraini",
    event: "Tumpeng Mini · Cibinong",
  },
]

/**
 * One word of the quote — blur-fades in (`blur(12px) → 0`, `y 20 → 0`) with a
 * word-by-word stagger, gated by `play` (the section has scrolled into view AND
 * this slide is active). Clears `filter` + `will-change` on completion so no
 * blur layer lingers (60fps rule, mirroring the shared `BlurReveal`).
 */
function QuoteWord({
  children,
  accent,
  index,
  play,
}: {
  children: ReactNode
  accent: boolean
  index: number
  play: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const visible = { opacity: 1, y: 0, filter: "blur(0px)" }
  const hidden = { opacity: 0, y: 20, filter: "blur(12px)" }
  return (
    <motion.span
      ref={ref}
      className={cn(
        "inline-block will-change-[transform,filter,opacity]",
        accent && "font-accent italic text-primary"
      )}
      initial={hidden}
      animate={play ? visible : hidden}
      transition={{
        duration: 0.7,
        ease: LUXURY_EASE,
        delay: play ? 0.15 + index * 0.05 : 0,
      }}
      onAnimationComplete={() => {
        ref.current?.style.removeProperty("filter")
        ref.current?.style.removeProperty("will-change")
      }}
    >
      {children}
    </motion.span>
  )
}

/** Splits a quote into word spans; `*word*` gets the italic accent. */
function QuoteWords({ text, play }: { text: string; play: boolean }) {
  const words = text.split(" ")
  return (
    <>
      {words.map((raw, i) => {
        const accent = /^\*(.+)\*$/.exec(raw)
        return (
          <QuoteWord key={i} accent={Boolean(accent)} index={i} play={play}>
            {accent ? accent[1] : raw}
            {i < words.length - 1 ? "\u00A0" : ""}
          </QuoteWord>
        )
      })}
    </>
  )
}

/**
 * Author name + event details — deliberately DECOUPLED from the quote's word
 * animation. They blur in line-by-line AFTER the quote finishes reading
 * (author ≈0.95s, event ≈1.15s) instead of appearing as one giant block that
 * cuts off abruptly. Gated by the same `play` signal so they also exit with
 * the slide.
 */
function MetaLines({
  author,
  event,
  play,
}: {
  author: string
  event: string
  play: boolean
}) {
  const authorRef = useRef<HTMLParagraphElement>(null)
  const eventRef = useRef<HTMLParagraphElement>(null)
  const authorVisible = { opacity: 1, y: 0, filter: "blur(0px)" }
  const eventVisible = { opacity: 1, y: 0, filter: "blur(0px)" }
  const hidden = { opacity: 0, y: 14, filter: "blur(8px)" }

  return (
    <div className="mt-12">
      <motion.p
        ref={authorRef}
        className="will-change-[transform,filter,opacity] text-[15px] text-primary"
        initial={hidden}
        animate={play ? authorVisible : hidden}
        transition={{
          duration: 0.6,
          ease: LUXURY_EASE,
          delay: play ? 0.95 : 0,
        }}
        onAnimationComplete={() => {
          authorRef.current?.style.removeProperty("filter")
          authorRef.current?.style.removeProperty("will-change")
        }}
      >
        {author}
      </motion.p>
      <motion.p
        ref={eventRef}
        className="will-change-[transform,filter,opacity] mt-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
        initial={hidden}
        animate={play ? eventVisible : hidden}
        transition={{
          duration: 0.6,
          ease: LUXURY_EASE,
          delay: play ? 1.15 : 0,
        }}
        onAnimationComplete={() => {
          eventRef.current?.style.removeProperty("filter")
          eventRef.current?.style.removeProperty("will-change")
        }}
      >
        {event}
      </motion.p>
    </div>
  )
}

/**
 * Testimonial / Review band — Tiska-paradigm (TISKA_SYSTEM_DESIGN §1–§5),
 * adapted to warm cream + amber tokens, ONE unified Framer choreography.
 *
 *  - Entrance (`useInView`, once): the WHOLE section starts visually empty;
 *    when the content is ~35% in view the sequence fires — eyebrow → quote
 *    words → author → event → pagination. Content-anchored (not a section-top
 *    trigger), so the reveal is SEEN instead of playing off-screen early.
 *  - Crossfade: CSS grid stacking (`col-start-1 row-start-1`) — every slide
 *    lives in the same cell, so the row always equals the TALLEST quote.
 *    Zero layout shift on mobile (no height tween, no min-h guess); the active
 *    slide fades in while the previous fades out. No AnimatePresence remount.
 *  - Autoplay: `setInterval` (6s) cycles the slides; pauses on hover; any dot
 *    click resets the timer (`activeIndex` dep); `clearInterval` on unmount.
 *  - Reduced motion: `MotionConfig reducedMotion="user"` → all transitions
 *    render instantly; autoplay still cycles so content stays reachable.
 */
function TestimonialBlock() {
  const contentRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  // Once the content is genuinely in view — the "magical first load" gate.
  const revealed = useInView(contentRef, { once: true, amount: 0.35 })

  // Autoplay loop — resets on every activeIndex change (incl. dot clicks).
  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % TESTIMONIALS.length)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [paused, activeIndex])

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="testimoni"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative overflow-hidden bg-secondary/60 px-5 py-20 md:py-27 md:px-10"
      >
        {/* Warm gold glow from the top — token-driven (primary amber at 9%),
            never a raw color. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-background)_100%,transparent),transparent_90%)]"
        />

        <div
          ref={contentRef}
          className="relative mx-auto container p-0 text-center lg:p-0"
        >
          {/* Eyebrow — 1st in the sequence */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.7, ease: LUXURY_EASE }}
            className="mb-11 text-[11px] uppercase tracking-[0.34em] text-primary"
          >
            Dari mereka yang mempercayakan momennya
          </motion.p>

          {/* Grid-stacked quotes — the row height is always the tallest slide. */}
          <div className="grid">
            {TESTIMONIALS.map((t, i) => {
              const isActive = i === activeIndex
              const play = revealed && isActive
              return (
                <motion.div
                  key={t.id}
                  className="col-start-1 row-start-1"
                  aria-hidden={!isActive}
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: LUXURY_EASE }}
                  style={{ pointerEvents: isActive ? "auto" : "none" }}
                >
                  <blockquote className="font-heading text-[clamp(30px,4.2vw,44px)] leading-[1.2] font-light tracking-[-0.025em] text-balance text-foreground">
                    <QuoteWords text={t.quote} play={play} />
                  </blockquote>
                  <MetaLines author={t.author} event={t.event} play={play} />
                </motion.div>
              )
            })}
          </div>

          {/* Pagination — last in the entrance sequence */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.6, ease: LUXURY_EASE, delay: 1.1 }}
            className="mt-13 flex items-center justify-center md:mt-12"
          >
            {TESTIMONIALS.map((t, i) => {
              const isActive = i === activeIndex
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Lihat testimoni ${i + 1}`}
                  aria-current={isActive}
                  className="group flex h-fit items-center px-2"
                >
                  <span
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      isActive
                        ? "w-7 bg-primary"
                        : "w-1.5 bg-foreground/25 group-hover:bg-foreground/45"
                    )}
                  />
                </button>
              )
            })}
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  )
}

export default TestimonialBlock
