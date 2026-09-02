"use client"

import { useCallback, useMemo, useRef } from "react"
import { Link } from "react-router"
import { MotionConfig } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight } from "@hugeicons/core-free-icons"
import { useGaleriPreviews } from "@/services/galeri/use-galeri-query"
import { useImageModalStore } from "@/store/image-modal-store"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { BlurReveal } from "@/components/motion/blur-reveal"
import { OriginButton } from "@/components/ui/fragments/custom-ui/button/cta-button"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { toMomentItem, type MomentItem } from "./moment-data"

const LUXURY_EASE = [0.16, 1, 0.3, 1] as unknown as gsap.EaseString

function MomentSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-5">
      <Skeleton className="col-span-12 aspect-[16/10] rounded-[22px] lg:col-span-8" />
      <Skeleton className="col-span-12 aspect-[3/4] rounded-[22px] md:col-span-6 lg:col-span-4" />
      <Skeleton className="hidden aspect-[4/3] rounded-[22px] md:col-span-6 lg:col-span-4 lg:block" />
      <Skeleton className="hidden aspect-[4/3] rounded-[22px] lg:col-span-4 lg:block" />
      <Skeleton className="hidden aspect-[3/4] rounded-[22px] lg:col-span-4 lg:block" />
    </div>
  )
}

/**
 * #momentum — bespoke editorial bento.
 *
 * Breaks the rigid uniform grid with an asymmetrical composition:
 *  - Tile 0: wide hero (8 cols) — the stage
 *  - Tile 1: tall portrait (4 cols) — counter-balance
 *  - Tiles 2-4: mixed trio — rhythm + whitespace, never monotonous.
 * Each tile carries traditional rounded [22px] + soft hover lift +
 * songket-shimmer hairline on hover, echoing Hero's songket bars.
 * Decluttered: only category + title (1-2 lines), generous padding.
 * Motion: mask clipPath reveal + y, staggered, respecting reduced-motion.
 */
export function MomentBlock() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  const { featured, results, isLoading } = useGaleriPreviews()
  const previewItems = useMemo(
    () => results.flatMap((r) => r.data?.items ?? []),
    [results]
  )
  const moments: MomentItem[] = useMemo(() => {
    const base = featured.length > 0 ? featured : previewItems
    return base.slice(0, 6).map(toMomentItem)
  }, [featured, previewItems])

  const openMoment = useCallback(
    (index: number) => {
      useImageModalStore.getState().open(
        moments.map((m) => ({
          src: m.imagePath,
          title: m.title,
          caption: m.description,
          category: m.category,
        })),
        index
      )
    },
    [moments]
  )

  useGSAP(
    () => {
      const el = sectionRef.current
      if (!el) return
      const q = gsap.utils.selector(el)
      const header = q("[data-moment-header]")
      const cards = q("[data-moment-card]")

      if (reduced) {
        gsap.set([...header, ...cards], { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0 0)" })
        return
      }

      gsap.set([...header, ...cards], { autoAlpha: 0, y: 28, clipPath: "inset(0 0 12% 0)" })

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 72%", once: true } })
        .fromTo(header, { y: 28, autoAlpha: 0, clipPath: "inset(0 0 12% 0)" }, { y: 0, autoAlpha: 1, clipPath: "inset(0 0 0 0)", duration: 0.7, ease: LUXURY_EASE }, 0)
        .fromTo(
          cards,
          { y: 28, autoAlpha: 0, clipPath: "inset(0 0 12% 0)" },
          { y: 0, autoAlpha: 1, clipPath: "inset(0 0 0 0)", duration: 0.62, ease: LUXURY_EASE, stagger: 0.07 },
          0.18
        )
    },
    { scope: sectionRef, dependencies: [moments.length, reduced] }
  )

  // Bento layout map — varied aspects create editorial tension (no 3-col monotony)
  const bentoClasses = [
    "col-span-12 lg:col-span-8 aspect-[16/10] lg:aspect-[16/10]", // 0 hero — wide
    "col-span-12 md:col-span-6 lg:col-span-4 aspect-[4/3] lg:aspect-[3/4]", // 1 tall
    "col-span-12 md:col-span-6 lg:col-span-4 aspect-[4/3]", // 2
    "col-span-12 md:col-span-6 lg:col-span-4 aspect-[4/3]", // 3
    "col-span-12 md:col-span-6 lg:col-span-4 aspect-[4/3] lg:aspect-[3/4]", // 4 portrait
    "col-span-12 md:col-span-6 lg:col-span-4 aspect-[4/3] hidden lg:flex", // 5 hidden until lg to keep 5-tile rhythm on desktop
  ]

  return (
    <MotionConfig reducedMotion="user">
      <section ref={sectionRef} id="momentum" className="relative overflow-hidden bg-secondary/40 py-20 md:py-26">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-background)_100%,transparent),transparent_85%)]" />

        <div className="relative container">
          <div data-moment-header className="mb-10 flex flex-col gap-8 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-6 flex items-center gap-3.5 text-[11px] tracking-[0.28em] text-primary uppercase">
                <span aria-hidden="true" className="h-px w-10 bg-primary" />
                <BlurReveal as="span" amount={0.3}>Portofolio</BlurReveal>
              </p>
              <h2 className="max-w-[560px] font-serif text-4xl leading-[1.06] tracking-tight text-foreground lg:text-5xl">
                <BlurReveal as="span" stagger={0.08} amount={0.3} className="block">Momen yang kami</BlurReveal>
                <BlurReveal as="span" stagger={0.08} amount={0.3} className="block font-accent italic text-primary">rayakan</BlurReveal>
              </h2>
            </div>
            <BlurReveal as="p" amount={0.3} className="max-w-[360px] shrink-0 text-[15px] leading-[1.8] text-muted-foreground">
              Jejak perayaan — dari pernikahan hingga syukuran, diabadikan dengan hangat.
            </BlurReveal>
          </div>

          {isLoading ? (
            <MomentSkeleton />
          ) : moments.length > 0 ? (
            <div className="grid grid-cols-12 gap-4 md:gap-5">
              {moments.slice(0, 5).map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  data-moment-card
                  onClick={() => openMoment(idx)}
                  aria-label={`${item.category} — ${item.title}`}
                  className={`group relative flex flex-col overflow-hidden rounded-[22px] bg-muted text-left ring-1 ring-border transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(0,0,0,0.22)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${bentoClasses[idx] ?? "col-span-12 md:col-span-6 lg:col-span-4 aspect-[4/3]"}`}
                >
                  <MediaItem
                    webViewLink={item.imagePath}
                    className="absolute inset-0 h-full w-full object-cover"
                    imageClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                  />
                  <span aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/15 to-transparent" />
                  <div className="relative mt-auto p-5 md:p-6">
                    <p className="text-[10px] tracking-[0.22em] text-accent uppercase">{item.category}</p>
                    <p className="mt-1.5 line-clamp-2 font-heading text-[17px] leading-tight font-medium text-background md:text-[18px]">
                      {item.title}
                    </p>
                  </div>
                  <span aria-hidden="true" className="absolute top-3 right-3 grid size-7 place-items-center rounded-full border border-background/30 bg-foreground/35 text-[11px] text-background/90 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:scale-105">
                    ⤢
                  </span>
                </button>
              ))}
              {/* 6th tile lives inside grid but hidden below lg — keeps bento rhythm */}
              {moments[5] && (
                <button
                  type="button"
                  data-moment-card
                  onClick={() => openMoment(5)}
                  aria-label={`${moments[5].category} — ${moments[5].title}`}
                  className="group relative hidden aspect-[4/3] flex-col overflow-hidden rounded-[22px] bg-muted text-left ring-1 ring-border transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(0,0,0,0.22)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:col-span-4 lg:flex"
                >
                  <MediaItem
                    webViewLink={moments[5].imagePath}
                    className="absolute inset-0 h-full w-full object-cover"
                    imageClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                  />
                  <span aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/15 to-transparent" />
                  <div className="relative mt-auto p-6">
                    <p className="text-[10px] tracking-[0.22em] text-accent uppercase">{moments[5].category}</p>
                    <p className="mt-1.5 line-clamp-2 font-heading text-[18px] leading-tight font-medium text-background">{moments[5].title}</p>
                  </div>
                </button>
              )}
            </div>
          ) : null}

          <div className="mt-12 flex justify-center">
            <Link to="/galeri">
              <OriginButton intensity={0.8} range={120} className="group border border-primary/40 bg-background text-xs tracking-[0.2em] uppercase sm:border-2 sm:border-primary sm:bg-transparent">
                Lihat Galeri Lengkap
                <HugeiconsIcon icon={ArrowRight} className="z-[9] size-4 transition-transform duration-500 group-hover:translate-x-1" />
              </OriginButton>
            </Link>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}

export default MomentBlock
