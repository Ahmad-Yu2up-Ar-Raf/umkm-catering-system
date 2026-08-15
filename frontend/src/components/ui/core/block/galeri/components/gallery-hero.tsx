"use client"

import { BlurReveal } from "@/components/motion/blur-reveal"
import { WordReveal } from "@/components/motion/word-reveal"
import { OriginButton } from "@/components/ui/fragments/custom-ui/button/cta-button"
import { ArrowRight } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "react-router"

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
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 pt-16 pb-8 text-center md:gap-8 md:pt-20 md:pb-13">
      <p className="flex items-center gap-3.5 text-[11px] tracking-[0.34em] text-primary uppercase">
        <span aria-hidden="true" className="h-px w-8 bg-primary/60 sm:w-10" />
        <BlurReveal as="span" amount={0.3}>
          Portofolio
        </BlurReveal>
        <span aria-hidden="true" className="h-px w-8 bg-primary/60 sm:w-10" />
      </p>

      <h1 className="font-heading text-[clamp(46px,8vw,104px)] leading-[0.92] font-light tracking-[-0.02em] text-foreground">
        <WordReveal text="Galeri *perayaan*" blur={8} trigger="mount" />
      </h1>

      <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
        <BlurReveal delay={0.15} amount={0.3}>
          Momen-momen yang kami rayakan bersama pelanggan — pernikahan, acara
          korporat, hingga bingkisan istimewa.
        </BlurReveal>
      </p>
      <BlurReveal
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
      </BlurReveal>
    </div>
  )
}
