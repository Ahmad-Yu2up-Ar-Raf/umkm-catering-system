"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight } from "@hugeicons/core-free-icons"
import { OriginButton } from "@/components/ui/fragments/custom-ui/button/cta-button"
import { Link } from "react-router"

/**
 * MenuHeader — eyebrow + display headline (with the single italic accent
 * word) + desktop CTA. The CTA reuses the global OriginButton (magnetic,
 * origin-fill) with a chevron-style arrow icon — no bespoke button markup.
 */
export function MenuHeader() {
  return (
    <div className="mb-9 flex flex-wrap items-end justify-between gap-4 md:mb-11">
      <div>
        <p className="mb-3 text-[11px] tracking-[0.34em] text-primary uppercase">
          Pilihan Menu
        </p>
        <h2 className="font-heading text-[clamp(30px,3.8vw,54px)] leading-[0.95] font-light tracking-[-0.02em] text-foreground">
          <span className="contents">
            <span className="inline-block">Cita&nbsp;</span>
            <span className="inline-block">rasa&nbsp;</span>
          </span>
          <span className="contents">
            <span className="inline-block font-accent text-primary italic">
              tanpa&nbsp;
            </span>
            <span className="inline-block font-accent text-primary italic">
              batas
            </span>
          </span>
        </h2>
      </div>

      <div className="hidden md:block">
        <Link to={"/paket"}>
          <OriginButton
            intensity={0.8}
            range={120}
            className="group border border-primary/40 bg-muted text-xs tracking-widest uppercase sm:border-2 sm:border-primary sm:bg-transparent"
          >
            Lihat Menu Lengkap
            <HugeiconsIcon
              icon={ArrowRight}
              className="z-[9] size-4 fill-none transition-transform duration-700 ease-out group-hover:translate-x-1"
            />
          </OriginButton>
        </Link>
      </div>
    </div>
  )
}
