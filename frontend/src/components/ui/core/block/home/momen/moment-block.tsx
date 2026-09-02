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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
      ))}
    </div>
  )
}

function MomentGrid({
  items,
  onOpen,
}: {
  items: MomentItem[]
  onOpen: (index: number) => void
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-7">
      {items.map((item, idx) => (
        <button
          key={item.id}
          type="button"
          data-moment-card
          onClick={() => onOpen(idx)}
          aria-label={`${item.category} — ${item.title}`}
          className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted text-left ring-1 ring-border transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <MediaItem
            webViewLink={item.imagePath}
            className="absolute inset-0 h-full w-full object-cover"
            imageClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-[10px] tracking-[0.22em] text-accent uppercase">
              {item.category}
            </p>
            <p className="mt-1.5 line-clamp-2 font-heading text-[17px] leading-tight font-medium text-background">
              {item.title}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="absolute top-3 right-3 grid size-7 place-items-center rounded-full border border-background/30 bg-foreground/40 text-[11px] text-background/90 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
          >
            ⤢
          </span>
        </button>
      ))}
    </div>
  )
}

/**
 * #momentum — rebuilt minimalist portfolio grid.
 *
 * Replaces the former two-part featured+marquee layout (crossfade carousel
 * + infinite marquee) with a clean symmetrical grid (3-col desktop, 2-col
 * tablet, 1-col mobile), generous whitespace (container py-20 md:py-26) and
 * the project's LUXURY_EASE staggered reveal — now cohesive with
 * About/Mengapa/FAQ/Ordering.
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
    { scope: sectionRef, dependencies: [moments.length, reduced] }
  )

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        id="momentum"
        className="relative overflow-hidden bg-secondary/40 py-20 md:py-26"
      >
        {/* Warm glow — token-driven, same as Mengapa/Testimonial */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-background)_100%,transparent),transparent_85%)]"
        />

        <div className="relative container">
          {/* Header — same grammar as Menu/About/Mengapa */}
          <div
            data-moment-header
            className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="mb-6 flex items-center gap-3.5 text-[11px] tracking-[0.28em] text-primary uppercase">
                <span aria-hidden="true" className="h-px w-10 bg-primary" />
                <BlurReveal as="span" amount={0.3}>
                  Portofolio
                </BlurReveal>
              </p>
              <h2 className="max-w-[560px] font-serif text-4xl leading-[1.06] tracking-tight text-foreground lg:text-5xl">
                <BlurReveal as="span" stagger={0.08} amount={0.3} className="block">
                  Momen yang kami
                </BlurReveal>
                <BlurReveal
                  as="span"
                  stagger={0.08}
                  amount={0.3}
                  className="block font-accent italic text-primary"
                >
                  rayakan
                </BlurReveal>
              </h2>
            </div>

            <BlurReveal
              as="p"
              amount={0.3}
              className="max-w-[360px] shrink-0 text-[15px] leading-[1.8] text-muted-foreground"
            >
              Jejak perayaan — dari pernikahan hingga syukuran, diabadikan
              dengan hangat.
            </BlurReveal>
          </div>

          {isLoading ? (
            <MomentSkeleton />
          ) : moments.length > 0 ? (
            <MomentGrid items={moments} onOpen={openMoment} />
          ) : null}

          <div className="mt-12 flex justify-center">
            <Link to="/galeri">
              <OriginButton
                intensity={0.8}
                range={120}
                className="group border border-primary/40 bg-background text-xs tracking-[0.2em] uppercase sm:border-2 sm:border-primary sm:bg-transparent"
              >
                Lihat Galeri Lengkap
                <HugeiconsIcon
                  icon={ArrowRight}
                  className="z-[9] size-4 transition-transform duration-500 group-hover:translate-x-1"
                />
              </OriginButton>
            </Link>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}

export default MomentBlock
