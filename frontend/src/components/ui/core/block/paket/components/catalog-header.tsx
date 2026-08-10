"use client"

import { ArrowRight02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { OriginButton } from "@/components/ui/fragments/custom-ui/button/cta-button"

/** Real client WhatsApp chat (also hard-coded in site-footer / faq-data). */
const WHATSAPP_URL = "https://wa.me/628561155113"

/**
 * CatalogHeader — the page's only hero (sitemap #3). Eyebrow + Fraunces
 * display headline with the single Instrument Serif accent word + WhatsApp
 * CTA. Revealed by ONE GSAP tween driven from `paket-block` (elements carry
 * `data-catalog-reveal`).
 */
export function CatalogHeader() {
  return (
    <div className="flex flex-col items-start gap-5 py-14 md:gap-6 md:py-20">
      <p
        data-catalog-reveal
        className="text-[11px] uppercase tracking-[0.34em] text-primary"
      >
        Katalog Paket
      </p>

      <h1
        data-catalog-reveal
        className="max-w-3xl font-heading text-[clamp(30px,3.8vw,54px)] leading-[0.95] font-light tracking-[-0.02em] text-foreground"
      >
        Dari dapur kami, untuk{" "}
        <span className="font-accent italic text-primary">perayaan</span> Anda.
      </h1>

      <p
        data-catalog-reveal
        className="max-w-xl text-base text-muted-foreground md:text-lg"
      >
        Nasi box, prasmanan, snack, hingga tumpeng dengan cita rasa rumahan.
        Konsultasi dan pemesanan langsung via WhatsApp.
      </p>

      <OriginButton
        data-catalog-reveal
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
  )
}
