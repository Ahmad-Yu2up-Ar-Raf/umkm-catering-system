"use client"

import { ArrowRight02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { OriginButton } from "@/components/ui/fragments/custom-ui/button/cta-button"
import { ScrollRotatingVisual } from "@/components/ui/core/visual/scroll-rotating-visual"

/** Real client WhatsApp chat (same number as catalog-header / site-footer). */
const WHATSAPP_URL = "https://wa.me/628561155113"

/** Brand hero object — reuses the top-down Tumpeng like the catalog header. */
const HERO_IMAGE = "/assets/images/about/tumpeng-from-top.png"

/**
 * GalleryHero — the page's only full hero (sitemap /galeri).
 *
 * Eyebrow "Portofolio" + Fraunces display headline with the single Instrument
 * Serif accent word ("perayaan") + WhatsApp CTA on the left, balanced by a
 * scroll-rotating brand visual in the right-hand whitespace (desktop only).
 * Revealed by ONE GSAP tween driven from `galeri-block` (elements carry
 * `data-gallery-reveal`) — identical grammar to the /paket hero.
 */
export function GalleryHero() {
  return (
    <div className="grid w-full gap-5 py-14 md:gap-6 md:py-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="flex flex-col items-start gap-5 md:gap-6">
        <p
          data-gallery-reveal
          className="flex items-center gap-3.5 text-[11px] tracking-[0.34em] text-primary uppercase"
        >
          <span aria-hidden="true" className="h-px w-10 bg-primary" />
          Portofolio
        </p>

        <h1
          data-gallery-reveal
          className="max-w-3xl font-heading text-[clamp(30px,3.8vw,54px)] leading-[0.95] font-light tracking-[-0.02em] text-foreground"
        >
          Galeri{" "}
          <span className="font-accent text-primary italic">perayaan</span>
        </h1>

        <p
          data-gallery-reveal
          className="max-w-xl text-base text-muted-foreground md:text-lg"
        >
          Momen-momen yang kami rayakan bersama pelanggan — pernikahan, acara
          korporat, hingga bingkisan istimewa.
        </p>

        <OriginButton
          data-gallery-reveal
          intensity={0.8}
          range={120}
          onClick={() => window.open(WHATSAPP_URL, "_blank", "noopener")}
          className="group mt-2 text-xs tracking-widest uppercase"
        >
          Konsultasi via WhatsApp
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            className="size-4 fill-none transition-transform duration-700 ease-out group-hover:translate-x-1"
          />
        </OriginButton>
      </div>

      {/* Right-hand whitespace — scroll-rotating brand visual (desktop only). */}
      <div className="hidden lg:flex lg:items-center lg:justify-end">
        <ScrollRotatingVisual
          imageSrc={HERO_IMAGE}
          alt="Tumpeng nasi kuning khas Nusantara dilihat dari atas"
          className="size-[260px] xl:size-[340px]"
        />
      </div>
    </div>
  )
}
