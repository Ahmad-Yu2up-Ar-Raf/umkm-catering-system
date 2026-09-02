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
import { PaketCard } from "@/components/ui/core/block/paket/components/paket-card"
import { useBestSellerPakets } from "@/components/ui/core/block/paket/hooks/use-paket-query"

const LUXURY_EASE = [0.16, 1, 0.3, 1] as unknown as gsap.EaseString

function MenuSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <Skeleton className="h-4 w-3/4 rounded-full" />
          <Skeleton className="h-3 w-1/2 rounded-full" />
        </div>
      ))}
    </div>
  )
}

/**
 * #pilihan-menu — rebuilt minimalist showcase.
 *
 * Layout mirrors About / Mengapa / FAQ : container + generous whitespace
 * (py-20 md:py-26), eyebrow+h2+description header, then a clean 3-col grid
 * of PaketCards (paket-card DNA, layoutMode="grid-3" compact + visual parity
 * with /paket). No tab list, no crossfade gallery — the cluttered two-panel
 * split is gone.
 *
 * Motion: single GSAP ScrollTrigger cascade header → cards stagger, once.
 * Reduced motion → static.
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
      const cards = q("[data-menu-card]")

      if (reduced) {
        gsap.set([...header, ...cards], { autoAlpha: 1, y: 0 })
        return
      }

      gsap.set([...header, ...cards], { autoAlpha: 0, y: 28 })

      gsap
        .timeline({
          scrollTrigger: { trigger: el, start: "top 75%", once: true },
        })
        .fromTo(
          header,
          { y: 28, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, ease: LUXURY_EASE },
          0
        )
        .fromTo(
          cards,
          { y: 28, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: LUXURY_EASE,
            stagger: 0.08,
          },
          0.15
        )
    },
    { scope: sectionRef, dependencies: [pakets.length, reduced] }
  )

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        id="pilihan-menu"
        className="container py-20 md:py-26"
      >
        {/* Header — same grammar as About/Mengapa/FAQ */}
        <div
          data-menu-header
          className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="mb-6 flex items-center gap-3.5 text-[11px] tracking-[0.28em] text-primary uppercase">
              <span aria-hidden="true" className="h-px w-10 bg-primary" />
              <BlurReveal as="span" amount={0.3}>
                Pilihan Menu
              </BlurReveal>
            </p>
            <h2 className="max-w-[640px] font-serif text-4xl leading-[1.06] tracking-tight text-foreground lg:text-5xl">
              <BlurReveal as="span" stagger={0.08} amount={0.3} className="block">
                Cita rasa
              </BlurReveal>
              <BlurReveal
                as="span"
                stagger={0.08}
                amount={0.3}
                className="block font-accent italic text-primary"
              >
                tanpa batas
              </BlurReveal>
            </h2>
          </div>

          <BlurReveal
            as="p"
            amount={0.3}
            className="max-w-[360px] shrink-0 text-[15px] leading-[1.8] text-muted-foreground"
          >
            Kurasi terlaris — dipilih dari pesanan terbanyak, dimasak segar
            dan siap diantar.
          </BlurReveal>
        </div>

        {/* Grid — minimalist 3-col, PaketCard DNA (grid-3 compact) */}
        {isLoading ? (
          <MenuSkeleton />
        ) : pakets.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {pakets.map((paket) => (
              <div key={paket.id} data-menu-card>
                <PaketCard paket={paket} layoutMode="grid-3" />
              </div>
            ))}
          </div>
        ) : null}

        {/* CTA — always visible, even while loading (no layout shift) */}
        <div className="mt-12 flex justify-center">
          <Link to="/paket">
            <OriginButton
              intensity={0.8}
              range={120}
              className="group border border-primary/40 bg-muted text-xs tracking-[0.2em] uppercase sm:border-2 sm:border-primary sm:bg-transparent"
            >
              Lihat Menu Lengkap
              <HugeiconsIcon
                icon={ArrowRight}
                className="z-[9] size-4 transition-transform duration-500 group-hover:translate-x-1"
              />
            </OriginButton>
          </Link>
        </div>
      </section>
    </MotionConfig>
  )
}
