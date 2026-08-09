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
      <BlurReveal
        as="h2"
        blur={8}
        stagger={0.08}
        amount={0.4}
        className="max-w-[760px] font-serif text-4xl md:leading-14 lg:text-5xl text-balance text-foreground"
      >
        Mengapa memilih{" "}
        <span className="font-accent italic text-primary">Nusantara</span>
      </BlurReveal>

      <div className="shrink-0">
        <BlurReveal
          as="p"
          blur={6}
          stagger={0.05}
          amount={0.4}
          className="max-w-[360px] text-[15px] leading-[1.8] text-muted-foreground"
        >
          Bukan sekadar angka — melainkan kepercayaan yang tumbuh dari dapur
          keluarga kami.
        </BlurReveal>
      </div>
    </div>
  )
}
