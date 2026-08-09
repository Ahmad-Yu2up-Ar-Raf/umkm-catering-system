"use client"

import { useEffect, useRef } from "react"

import { MotionConfig } from "framer-motion"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { BlurReveal } from "@/components/motion/blur-reveal"
import { WordReveal } from "@/components/motion/word-reveal"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { ORDER_STEPS } from "./ordering-data"
import OrderingMobileTimeline from "./ordering-mobile-timeline"

/**
 * #cara-pesan — the 7-step ordering workflow as a scroll-pinned timeline.
 * Interaction adapted from tiskacatering.com/#perjalanan-kami, re-skinned into
 * Catering Nusantara's warm cream/amber tokens.
 *
 * Motion architecture (GSAP ScrollTrigger, `prefers-reduced-motion` → static):
 *  - ENTRY: as the section scrolls in, the header (word-blur primitives) then
 *    the step stage → Polaroid → footer nav rise/fade in with a stagger —
 *    before the pin engages. No group sits statically on first sight.
 *  - PIN: the section is pinned for `PIN_END` (~2600px) with `scrub: true`
 *    (1:1 — Lenis supplies the smoothing, so no magnetic lag). No snap. Each
 *    step spans 0.57 timeline units: a 0.45s transition, then a 0.12-unit
 *    micro-pause — a tiny breath, never a scroll dead zone.
 *  - STEP CHUNKS: every actor of a step — era out/in, Polaroid out/in — sits at
 *    the SAME timeline position `p` with the SAME 0.45s duration. The Polaroids
 *    are a PURE opacity crossfade + Y-flip: the outgoing card flips 0 → -90°
 *    while fading out, the incoming flips 90° → 0° while fading in — they cross
 *    mid-air and are NEVER beyond ±90° (no mirrored backface, no upside-down).
 *  - NAV: the active numeral is toggled DIRECTLY on the DOM inside the
 *    ScrollTrigger `onUpdate` (class swap + CSS transition) — no React state,
 *    so the heavy GSAP wrapper never re-renders during the pin (no frame
 *    drops, no skipped steps on standard mouse-wheel ticks).
 *  - IDLE: a dedicated `data-idle-float` wrapper (separate from the scroll-flip
 *    and the entrance wrappers) bobs the Polaroid continuously (±15px, ±1.5°).
 */
/** Pinned scroll distance (~430px per step) — padding for standard wheels. */
const PIN_END = 3000

/** Timeline units — every step chunk shares these so all actors stay coupled.
 *  Each step spans SEG (0.57) units: the 0.45s transition, then a 0.12-unit
 *  MICRO-pause. Just enough to breathe — never a dead zone where scrolling
 *  does nothing. */
const DUR = 0.45
const REST = 0.12
const SEG = DUR + REST
/** Indicator switches at 60% THROUGH the incoming transition (not 100%),
 *  so the numeral lights while the new card is arriving — never after. */
const TRIGGER_AT = 0.6
/** Total timeline length = 6 segments + the final transition. */
const TOTAL = (ORDER_STEPS.length - 1) * SEG + DUR
/** Scroll progress at which each step's indicator should activate. */
const STEP_TRIGGER = ORDER_STEPS.map((_, i) =>
  i === 0 ? 0 : (i * SEG + TRIGGER_AT * DUR) / TOTAL
)

function OrderingBlock() {
  const sectionRef = useRef<HTMLElement>(null)
  const floatRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  // The desktop-only matchMedia. Held in a ref so strict-mode remounts / route
  // changes can revert it deterministically (useGSAP does not track it).
  const mmRef = useRef<ReturnType<typeof gsap.matchMedia> | null>(null)

  useEffect(() => {
    return () => {
      mmRef.current?.revert()
      mmRef.current = null
    }
  }, [])

  useGSAP(
    () => {
      if (reduced || !sectionRef.current) return

      // Desktop/tablet ONLY (≥768px). On mobile the ordering section is a plain
      // vertical-scroll timeline — no pin, no scroll-hijacking on touch.
      const mm = gsap.matchMedia()
      mmRef.current = mm
      mm.add("(min-width: 768px)", () => {
        const q = gsap.utils.selector(sectionRef.current)
        const eras = q("[data-era]")
        const photos = q("[data-era-foto]")
        const indicators = q("[data-indicator]")
        if (!eras.length) return

        // ── ENTRY — stage → Polaroid → nav rise/fade in, staggered, once.
        // (The header reveals via its own WordReveal/BlurReveal primitives just
        // before this, so the sequence reads header → content → photo → nav.)
        gsap.fromTo(
          q("[data-era-stage], [data-polaroid-entrance], [data-order-nav]"),
          { y: 40, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              once: true,
            },
          }
        )

        // Stage the initial state: step 01 visible, everything else prepared.
        gsap.set(eras, { autoAlpha: 0, y: 40 })
        gsap.set(eras[0], { autoAlpha: 1, y: 0 })
        gsap.set(photos, { rotationY: -90, autoAlpha: 0 })
        gsap.set(photos[0], { rotationY: 0, autoAlpha: 1 })

        // ── PINNED scrub timeline — `scrub: 0.8` interpolates the ~100px jumps
        // of a standard mouse wheel so a fast tick never teleports past a step.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: `+=${PIN_END}`,
            pin: true,
            scrub: 0.8,
            onUpdate: (self) => {
              // Light the numeral at ~60% through the incoming transition. The
              // indicator classes are toggled DIRECTLY on the DOM — no React
              // state, no re-render of the heavy GSAP wrapper — so the main
              // thread stays free and the timeline never drops frames mid-scrub.
              const progress = self.progress
              let idx = 0
              for (let i = 1; i < ORDER_STEPS.length; i++) {
                if (progress >= STEP_TRIGGER[i]) idx = i
              }
              indicators.forEach((el, i) => {
                el.classList.toggle("text-primary", i === idx)
                el.classList.toggle("text-foreground/30", i !== idx)
              })
            },
          },
        })

        ORDER_STEPS.forEach((_, i) => {
          if (i === 0) return
          // Every actor of the step sits at the SAME position `p` with the SAME
          // duration — text and image are perfectly coupled (no desync).
          const p = i * SEG

          // LEFT — previous step lifts out, next lifts in, concurrently.
          tl.to(
            eras[i - 1],
            { y: -40, autoAlpha: 0, duration: DUR, ease: "power2.inOut" },
            p
          )
          tl.fromTo(
            eras[i],
            { y: 40, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: DUR, ease: "power2.inOut" },
            p
          )

          // RIGHT — Polaroids cross mid-air: a PURE opacity crossfade + Y-flip.
          // Outgoing 0 → -90° while fading out; incoming 90° → 0° while fading
          // in. Both start at the same millisecond `p`, never beyond ±90°.
          tl.to(
            photos[i - 1],
            {
              rotationY: -90,
              autoAlpha: 0,
              duration: DUR,
              ease: "power2.inOut",
            },
            p
          )
          tl.fromTo(
            photos[i],
            { rotationY: 90, autoAlpha: 0 },
            {
              rotationY: 0,
              autoAlpha: 1,
              duration: DUR,
              ease: "power2.inOut",
            },
            p
          )
        })

        // ── IDLE — the Polaroid bobs continuously on its OWN wrapper (never the
        // element the scroll timeline or the entrance touches). More noticeable:
        // ±15px on Y with a ±1.5° whisper of rotation, sine ease, yoyo forever.
        gsap.fromTo(
          floatRef.current,
          { y: -15, rotation: -1.5 },
          {
            y: 15,
            rotation: 1.5,
            duration: 5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          }
        )
      })
    },
    { scope: sectionRef }
  )

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        id="cara-pesan"
        className="relative isolate flex flex-col justify-center overflow-hidden pt-15 pb-20 text-foreground md:h-screen md:py-0"
      >
        {/* Warm amber glow from the upper-right — token-driven, never raw. */}
        {/* <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-background)_100%,transparent),transparent_100%)]"
        /> */}

        {/* `container` — the same global constraint as About / FAQ / Testimonial. */}
        <div className="container">
          {/* ── DESKTOP / TABLET (md+): pinned stage + scrub Polaroid. Hidden
              below 768px so the scroll-pin never engages a touch device. */}
          <div className="hidden grid-cols-1 items-center gap-x-12 gap-y-6 md:grid md:grid-cols-[1.08fr_0.92fr]">
            {/* ───────────── LEFT — header + step stage + numeral nav ───────────── */}
            <div>
              <div className="mb-6 md:mb-11">
                <p className="mb-5 flex items-center gap-3.5 text-[11px] font-normal tracking-[0.28em] text-primary uppercase">
                  <span aria-hidden="true" className="h-px w-10 bg-primary" />
                  <BlurReveal as="span" blur={6} amount={0.5}>
                    Cara Pemesanan
                  </BlurReveal>
                </p>
                {/* Two-line headline — EXACT structure:
                  Line 1: "Tujuh langkah," — standard face + foreground.
                  Line 2: "satu hidangan" — accent/italic serif + primary.
                  WordReveal supplies the word-blur reveal; the words inherit
                  the parent span's styling. */}
                <h2 className="max-w-[460px] font-heading text-[clamp(30px,3.6vw,52px)] leading-[1.06] font-light tracking-[-0.02em]">
                  <span className="block text-foreground">
                    <WordReveal
                      text="Tujuh langkah,"
                      blur={10}
                      duration={0.8}
                      stagger={0.07}
                      trigger="scroll"
                      scrollStart="top 85%"
                    />
                  </span>
                  <span className="block font-accent text-primary italic">
                    <WordReveal
                      text="satu hidangan"
                      blur={10}
                      duration={0.8}
                      stagger={0.07}
                      trigger="scroll"
                      scrollStart="top 85%"
                    />
                  </span>
                </h2>
              </div>

              {/* Step stage — stacked; GSAP crossfades/slides between steps.
                Entrance targets this container so the whole stage rises in. */}
              <div data-era-stage className="relative h-[200px] md:h-[260px]">
                {ORDER_STEPS.map((s, i) =>
                  reduced && i > 0 ? null : (
                    <div
                      key={s.id}
                      data-era
                      className="pointer-events-none absolute inset-0 will-change-transform"
                    >
                      <p
                        className="font-heading text-[clamp(48px,11vw,120px)] leading-[0.84] font-light text-primary"
                        style={{ fontVariationSettings: '"opsz" 144' }}
                      >
                        {s.step}
                      </p>
                      <p className="mt-5 mb-4 text-[12.5px] tracking-[0.22em] text-primary/70 uppercase">
                        {s.title}
                      </p>
                      {/* Fixed min-height so all steps hold 3 lines of
                        description — the stage never reflows. */}
                      <p className="min-h-[76px] max-w-[440px] text-[14px] leading-[1.8] text-muted-foreground md:min-h-[88px] md:text-[16px]">
                        {s.description}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Numeral nav — the active class is toggled directly on the DOM by
                the ScrollTrigger `onUpdate` (zero React re-renders during the
                pin). Step 01 is active on first paint; GSAP maintains it. */}
              <div
                data-order-nav
                className="mt-6 flex items-center gap-6 border-t border-border pt-6 md:mt-8"
              >
                {ORDER_STEPS.map((s, i) => (
                  <span
                    key={s.id}
                    data-indicator
                    className={cn(
                      "text-[12px] tracking-[0.1em] transition-all duration-500 ease-in-out",
                      i === 0 ? "text-primary" : "text-foreground/30"
                    )}
                  >
                    {s.step}
                  </span>
                ))}
              </div>
            </div>

            {/* ───────────── RIGHT — the floating Polaroid stack ───────────── */}
            {/* Layer 1: entrance (fade/rise, once). Layer 2: idle float (yoyo).
              Layer 3: perspective + per-photo flips. No element is tweened by
              two systems, so the float never stutters during transitions. */}
            <div
              data-polaroid-entrance
              className="relative mx-auto w-full max-w-[240px] md:ml-auto md:max-w-[500px]"
            >
              <div
                ref={floatRef}
                data-idle-float
                className="will-change-transform"
              >
                <div
                  className="relative aspect-[1/1.13] md:aspect-[1/1.13]"
                  style={{ perspective: "1500px" }}
                >
                  {ORDER_STEPS.map((s, i) =>
                    reduced && i > 0 ? null : (
                      <div
                        key={s.id}
                        data-era-foto
                        className="absolute inset-0 flex flex-col rounded-[3px] border border-border bg-card p-[15px] shadow-lg will-change-transform [backface-visibility:hidden] [transform-style:preserve-3d]"
                      >
                        <div className="relative flex-1 overflow-hidden rounded-sm bg-muted">
                          <MediaItem
                            webViewLink={s.image}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="pt-3.5 pb-1 text-center font-accent text-[15px] leading-none text-foreground/80 italic md:text-[17px]">
                          {s.title}
                          <span className="ml-2 font-sans text-[12px] text-foreground/45 not-italic">
                            · {s.step}
                          </span>
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* end desktop grid (md+) */}

          {/* ── MOBILE (< md): an elegant left-rail timeline — no pin, no
              scroll-hijacking on touch. A single hairline with a dot per
              step; typography sits to the right, revealing on scroll
              (Framer `whileInView`). */}
          <div className="md:hidden">
            <div className="mt-0 mb-10">
              <p className="mb-4 flex items-center gap-3.5 text-[11px] font-normal tracking-[0.28em] text-primary uppercase">
                <span aria-hidden="true" className="h-px w-10 bg-primary" />
                Cara Pemesanan
              </p>
              <h2 className="max-w-[340px] font-heading text-[clamp(26px,7.5vw,32px)] leading-[1.12] font-light tracking-[-0.02em]">
                <span className="block text-foreground">Tujuh langkah,</span>
                <span className="block font-accent text-primary italic">
                  satu hidangan
                </span>
              </h2>
            </div>

            <OrderingMobileTimeline />
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}

export default OrderingBlock
