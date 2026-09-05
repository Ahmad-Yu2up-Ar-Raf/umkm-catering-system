"use client"

import { BlurReveal } from "@/components/motion/blur-reveal"

/**
 * MengapaHeader — flex layout: H2 (left, with the single italic accent word)
 * + short description (right, max 360px).
 *
 *  - H2 typography mirrors the About/FAQ section titles ("Setiap perayaan
 *    kisah Anda."): `font-serif text-4xl md:leading-14 lg:text-5xl`, normal
 *    weight (no `font-light`), taller leading — reads bolder and bigger,
 *    especially on mobile where the clamped light variant felt too small.
 *  - The H2 is wrapped in `BlurReveal` (single blur-fade so the accent span
 *    survives intact); the description uses the word-by-word blur.
 *  - `prefers-reduced-motion` → instant render (parent `MotionConfig`).
 */
export function MengapaHeader() {
  return (
    <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
      <div className="md:hidden">
        <p className="text-gold-deep mb-6 flex items-center gap-3.5 text-[11px] font-normal tracking-[0.28em] uppercase">
          <div aria-hidden="true" className="h-px w-10 bg-primary" />
          <BlurReveal as="span" className="text-primary" amount={0.3}>
            Keunggulan Kami
          </BlurReveal>
        </p>
      </div>
      <h2 className="max-w-[760px] font-serif text-4xl text-balance text-foreground md:leading-14 lg:text-5xl">
        <BlurReveal as="span" blur={8} stagger={0.08} amount={0.4}>
          Mengapa memilih
        </BlurReveal>
        <BlurReveal
          as="span"
          blur={8}
          stagger={0.08}
          amount={0.4}
          className="block font-accent text-primary italic"
        >
          Catering Nusantara
        </BlurReveal>
      </h2>

      <div className="shrink-0">
        <BlurReveal
          as="p"
          blur={6}
          stagger={0.05}
          amount={0.4}
          className="max-w-[360px] text-[15px] leading-[1.8] text-muted-foreground lg:text-sm"
        >
          Bukan sekadar angka — melainkan kepercayaan yang tumbuh dari dapur
          keluarga kami.
        </BlurReveal>
      </div>
    </div>
  )
}
