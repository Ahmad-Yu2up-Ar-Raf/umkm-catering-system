"use client"

import { useMemo, useRef } from "react"
import { Link } from "react-router"
import { MotionConfig } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight } from "@hugeicons/core-free-icons"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { BlurReveal } from "@/components/motion/blur-reveal"
import { OriginButton } from "@/components/ui/fragments/custom-ui/button/cta-button"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { useBestSellerPakets } from "@/components/ui/core/block/paket/hooks/use-paket-query"
import {
  getCategoryColor,
  getCategoryIcon,
} from "@/components/ui/core/block/paket/utils/paket-kategori-utils.ts"
import type { Paket } from "@/components/ui/core/block/paket/types/paket-types"

const LUXURY_EASE = [0.16, 1, 0.3, 1] as unknown as gsap.EaseString

const formatIDR = (value: string | number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value))

function BentoSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-5">
      <Skeleton className="col-span-12 aspect-[16/11] rounded-[22px] lg:col-span-7 lg:aspect-[16/12]" />
      <div className="col-span-12 grid gap-4 lg:col-span-5">
        <Skeleton className="aspect-[16/10] rounded-[22px]" />
        <Skeleton className="aspect-[16/10] rounded-[22px]" />
      </div>
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="col-span-12 aspect-[4/3] rounded-[22px] md:col-span-4" />
      ))}
    </div>
  )
}

/** Compact paket tile — distilled from paket-card but decluttered for homepage bento. */
function BentoPaketCard({
  paket,
  featured = false,
}: {
  paket: Paket
  featured?: boolean
}) {
  const Icon = getCategoryIcon(paket.kategori_paket)
  const color = getCategoryColor(paket.kategori_paket)
  return (
    <Link
      to={`/paket/${paket.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[22px] bg-card ring-1 ring-border transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(0,0,0,0.22)]"
    >
      <div className={`relative overflow-hidden bg-muted ${featured ? "aspect-[16/11] lg:aspect-[16/12]" : "aspect-[16/10] sm:aspect-[4/3]"}`}>
          <MediaItem
          webViewLink={paket.thumbnail ?? ""}
          className="absolute inset-0 h-full w-full object-cover"
          imageClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
        />
        {/* Traditional songket-inspired top hairline — brand motif */}
        <span aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {paket.is_best_seller && (
          <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium tracking-[0.14em] text-primary backdrop-blur">
            BEST SELLER
          </span>
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-transparent to-transparent opacity-60" />
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center gap-2">
          <Badge icon={Icon} variant="outline" className={`border-0 text-[11px] shadow-none ${color}`}>
            {paket.kategori_paket}
          </Badge>
          <span className="ml-auto text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
            {paket.pesanan_count} terjual
          </span>
        </div>
        <h3 className={`line-clamp-1 font-heading font-semibold tracking-tight text-foreground ${featured ? "text-[22px] leading-tight" : "text-[17px] leading-tight"}`}>
          {paket.nama_paket}
        </h3>
        {!featured && (
          <p className="line-clamp-1 text-sm leading-relaxed text-muted-foreground">
            {paket.deskripsi ?? paket.menu_utama.slice(0, 2).join(" · ")}
          </p>
        )}
        {featured && (
          <p className="line-clamp-2 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">
            {paket.deskripsi ?? paket.menu_utama.slice(0, 3).join(" · ")}
          </p>
        )}
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="font-heading text-[18px] font-semibold tracking-tight text-foreground">
            {formatIDR(paket.harga_per_porsi)}
          </span>
          <span className="text-xs text-muted-foreground">/ porsi</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] tracking-[0.14em] text-primary opacity-0 transition-all duration-300 group-hover:gap-2 group-hover:opacity-100">
            Lihat <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

/**
 * #pilihan-menu — bespoke bento editorial.
 *
 * Replaces the rigid 3-col uniform grid with an asymmetrical bento:
 *  - Row 1: featured (7 cols, taller) + 2 stacked (5 cols) — varied aspect,
 *    creates rhythm and hierarchy.
 *  - Row 2: 3 compact cards across — breathable, not cramped.
 * Traditional hairline + rounded [22px] + soft hover lift + songket shimmer.
 * Motion: one ScrollTrigger cascade header → bento tiles stagger.
 */
export function PilihanMenuBlock() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const query = useBestSellerPakets()
  const pakets = useMemo(() => query.data?.slice(0, 6) ?? [], [query.data])
  const isLoading = query.isLoading

  useGSAP(
    () => {
      const el = sectionRef.current
      if (!el) return
      const q = gsap.utils.selector(el)
      const header = q("[data-menu-header]")
      const tiles = q("[data-menu-tile]")

      if (reduced) {
        gsap.set([...header, ...tiles], { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0 0)" })
        return
      }

      // Elegant mask reveal — clipPath + y, not just opacity.
      gsap.set([...header, ...tiles], { autoAlpha: 0, y: 28, clipPath: "inset(0 0 12% 0)" })

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 72%", once: true } })
        .fromTo(header, { y: 28, autoAlpha: 0, clipPath: "inset(0 0 12% 0)" }, { y: 0, autoAlpha: 1, clipPath: "inset(0 0 0 0)", duration: 0.7, ease: LUXURY_EASE }, 0)
        .fromTo(
          tiles,
          { y: 28, autoAlpha: 0, clipPath: "inset(0 0 12% 0)" },
          { y: 0, autoAlpha: 1, clipPath: "inset(0 0 0 0)", duration: 0.65, ease: LUXURY_EASE, stagger: 0.07 },
          0.18
        )
    },
    { scope: sectionRef, dependencies: [pakets.length, reduced] }
  )

  return (
    <MotionConfig reducedMotion="user">
      <section ref={sectionRef} id="pilihan-menu" className="relative overflow-hidden py-20 md:py-26">
        {/* Subtle warm halo — same family as Hero/Mengapa, never raw */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-background)_100%,transparent),transparent_88%)]" />

        <div className="relative container">
          {/* Header — Tentang/Mengapa grammar */}
          <div data-menu-header className="mb-10 flex flex-col gap-8 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-6 flex items-center gap-3.5 text-[11px] tracking-[0.28em] text-primary uppercase">
                <span aria-hidden="true" className="h-px w-10 bg-primary" />
                <BlurReveal as="span" amount={0.3}>Pilihan Menu</BlurReveal>
              </p>
              <h2 className="max-w-[640px] font-serif text-4xl leading-[1.06] tracking-tight text-foreground lg:text-5xl">
                <BlurReveal as="span" stagger={0.08} amount={0.3} className="block">Cita rasa</BlurReveal>
                <BlurReveal as="span" stagger={0.08} amount={0.3} className="block font-accent italic text-primary">tanpa batas</BlurReveal>
              </h2>
            </div>
            <BlurReveal as="p" amount={0.3} className="max-w-[360px] shrink-0 text-[15px] leading-[1.8] text-muted-foreground">
              Kurasi terlaris — enam hidangan pilihan, dimasak segar dan siap diantar hangat.
            </BlurReveal>
          </div>

          {isLoading ? (
            <BentoSkeleton />
          ) : pakets.length >= 6 ? (
            <div className="grid grid-cols-12 gap-4 md:gap-5">
              {/* Row 1 — featured + stacked */}
              <div data-menu-tile className="col-span-12 lg:col-span-7">
                <BentoPaketCard paket={pakets[0]} featured />
              </div>
              <div className="col-span-12 grid gap-4 lg:col-span-5">
                <div data-menu-tile><BentoPaketCard paket={pakets[1]} /></div>
                <div data-menu-tile><BentoPaketCard paket={pakets[2]} /></div>
              </div>
              {/* Row 2 — three across */}
              {pakets.slice(3, 6).map((p) => (
                <div key={p.id} data-menu-tile className="col-span-12 md:col-span-4">
                  <BentoPaketCard paket={p} />
                </div>
              ))}
            </div>
          ) : pakets.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
              {pakets.map((p) => (
                <div key={p.id} data-menu-tile><BentoPaketCard paket={p} /></div>
              ))}
            </div>
          ) : null}

          <div className="mt-12 flex justify-center">
            <Link to="/paket">
              <OriginButton intensity={0.8} range={120} className="group border border-primary/40 bg-muted text-xs tracking-[0.2em] uppercase sm:border-2 sm:border-primary sm:bg-transparent">
                Lihat Menu Lengkap
                <HugeiconsIcon icon={ArrowRight} className="z-[9] size-4 transition-transform duration-500 group-hover:translate-x-1" />
              </OriginButton>
            </Link>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}
