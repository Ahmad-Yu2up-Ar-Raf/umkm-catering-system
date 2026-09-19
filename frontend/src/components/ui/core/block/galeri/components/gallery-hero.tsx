"use client"

import { useRef } from "react"

import { BlurReveal } from "@/components/motion/blur-reveal"
import { WordReveal } from "@/components/motion/word-reveal"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

/**
 * GalleryHero — ultra-minimalist, editorial, centered (architectural
 * blueprint §5.1). Flat `bg-background`, no hero object clone.
 *
 * Eyebrow "Portofolio" flanked by mirrored hairlines → oversized Fraunces
 * display H1 (magazine headline scale) with the single Instrument Serif
 * italic accent word (Tiska grammar) via a word-by-word blur `WordReveal` →
 * muted editorial sub. No CTA — this page converts below. This is the page's
 * ONE signature reveal; everything below is declarative.
 */
export function GalleryHero() {
  const rootRef = useRef<HTMLDivElement>(null)
  const eyebrowLineLRef = useRef<HTMLSpanElement>(null)
  const eyebrowLineRRef = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  // Hero-identical eyebrow hairlines — both expand scaleX 0 → 1 in perfect
  // sync, mirroring outward from the label on the same beat as its blur.
  useGSAP(
    () => {
      if (reduced) return
      if (eyebrowLineLRef.current && eyebrowLineRRef.current) {
        gsap.set(eyebrowLineLRef.current, { transformOrigin: "right center" })
        gsap.set(eyebrowLineRRef.current, { transformOrigin: "left center" })
        gsap.fromTo(
          [eyebrowLineLRef.current, eyebrowLineRRef.current],
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: "power2.out", delay: 0.35 }
        )
      }
    },
    { scope: rootRef }
  )

  return (
    <div
      ref={rootRef}
      className="mx-auto flex max-w-4xl flex-col items-center gap-6 pt-16 pb-8 text-center md:gap-8 md:pt-20 md:pb-13"
    >
      <p className="flex items-center gap-3.5 text-[11px] tracking-[0.34em] text-primary uppercase">
        <span
          ref={eyebrowLineLRef}
          aria-hidden="true"
          className="h-px w-8 bg-primary/60 sm:w-10"
        />
        <BlurReveal
          as="span"
          onMount
          blur={6}
          stagger={0.08}
          delay={0.35}
          amount={0.3}
        >
          Portofolio
        </BlurReveal>
        <span
          ref={eyebrowLineRRef}
          aria-hidden="true"
          className="h-px w-8 bg-primary/60 sm:w-10"
        />
      </p>

      <h1 className="font-heading text-[clamp(46px,8vw,104px)] leading-[0.92] font-light tracking-[-0.02em] text-foreground">
        <WordReveal
          text="Galeri *perayaan*"
          blur={12}
          duration={1}
          stagger={0.2}
          delay={0.35}
          trigger="mount"
        />
      </h1>

      <BlurReveal
        as="p"
        onMount
        blur={6}
        stagger={0.04}
        delay={0.35 * 3}
        amount={0.3}
        className="max-w-2xl text-sm sm:text-base text-muted-foreground md:text-lg"
      >
        Momen-momen yang kami rayakan bersama pelanggan — pernikahan, acara
        korporat, hingga bingkisan istimewa.
      </BlurReveal>
      {/* <BlurReveal
        as="span"
        onMount
        blur={6}
        stagger={0.12}
        delay={0.35 * 3}
        className="inline-block mt-2"
      >
        <Link to={"/galeri/semua"}>
          <OriginButton
            intensity={0.8}
            range={120}
            className="group border border-primary/40 text-xs tracking-widest uppercase sm:border-2 sm:border-primary"
          >
            Lihat Galeri
            <HugeiconsIcon
              icon={ArrowRight}
              className="z-[9] size-4 fill-none transition-transform duration-700 ease-out group-hover:translate-x-1"
            />
          </OriginButton>
        </Link>
      </BlurReveal> */}
    </div>
  )
}
