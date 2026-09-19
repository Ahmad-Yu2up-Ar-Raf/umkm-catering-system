"use client"

import { Link } from "react-router"

import { ArrowRight } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, type Variants } from "framer-motion"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/fragments/shadcn-ui/carousel"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import { cn } from "@/lib/utils"

import type { GalleryCategory } from "../types/gallery-types"
import type { GalleryItem } from "../types/gallery-types"
import { GalleryCard } from "./gallery-card"

/** Premium ease — Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/**
 * Coordinated scroll reveal: heading/CTA first, carousel content after.
 * Elegant blur + fade-up, once per section as it enters the viewport.
 * `MotionConfig reducedMotion="user"` (storefront root) collapses the
 * transform/filter to a plain opacity fade automatically.
 */
const sectionVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: LUXURY_EASE },
  },
}

/**
 * GalleryCategorySection — one editorial rail on the storefront.
 *
 * Heading (category label) → "Lihat Semua" CTA deep-linking into
 * `/galeri/:slug` (where the heavy dataset lives) → a Shadcn `Carousel`
 * (Embla) of the PREVIEW items with a mobile peek. Prev/Next round buttons on
 * desktop, native swipe + edge drag on touch. The lightbox scope = this
 * rail's items only, in display order. Reveals when the section enters the
 * viewport (once — no re-animation on scroll).
 */
export function GalleryCategorySection({
  category,
  items,
  isLoading,
}: {
  category: GalleryCategory
  items: GalleryItem[]
  isLoading: boolean
}) {
  const headingId = `galeri-rail-${category.slug}`

  // ponytail: settled + zero items = no section at all (no bare heading or
  // dead CTA left in the DOM). The caller also skips these; this guards any
  // other consumer of the section.
  if (!isLoading && items.length === 0) return null

  return (
    <motion.section
      id={`rail-${category.slug}`}
      aria-labelledby={headingId}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={sectionVariants}
    >
      <motion.div
        variants={lineVariants}
        className="mb-6 px-6 flex flex-wrap items-baseline justify-between gap-3 md:mb-5 md:px-2"
      >
        <h2
          id={headingId}
          className="font-heading text-[clamp(24px,3vw,28px)] leading-tight font-light tracking-[-0.01em] text-foreground"
        >
          {category.label}
        </h2>

        <Link
          // ponytail: an empty rail would deep-link into a broken filtered
          // state — point it at the unfiltered storefront instead.
          to={
            items.length === 0
              ? "/galeri?kategori=Semua"
              : `/galeri/${category.slug}`
          }
          className={cn(
            "group inline-flex items-center gap-1.5 text-[10px] tracking-[0.22em] text-primary uppercase sm:text-[11px]",
            "transition-colors duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          )}
        >
          Lihat Semua
          <HugeiconsIcon
            icon={ArrowRight}
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </motion.div>

      <motion.div variants={lineVariants}>
        {isLoading ? (
          <div className="flex gap-3">
            {Array.from({ length: 4 }, (_, j) => (
              <Skeleton
                key={j}
                className="aspect-[16/10] shrink-0 basis-[60%] rounded-2xl sm:basis-[40%] md:basis-[30%] lg:basis-[24%]"
              />
            ))}
          </div>
        ) : items.length === 0 ? null : (
          <Carousel
            opts={{ align: "start", containScroll: "trimSnaps" }}
            className="w-full"
          >
            <CarouselContent className="ml-3 md:-ml-2">
              {items.map((item, index) => (
                <CarouselItem
                  key={item.id}
                  className="basis-[60%] pl-3 sm:basis-[40%] md:basis-[30%] lg:basis-[24%]"
                >
                  <GalleryCard
                    item={item}
                    index={index}
                    scope={items}
                    className="aspect-[16/10] w-full"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-6 hidden items-center gap-2 md:flex">
              <CarouselPrevious className="static inset-auto my-0 hidden translate-none md:flex" />
              <CarouselNext className="static inset-auto my-0 hidden translate-none md:flex" />
            </div>
          </Carousel>
        )}
      </motion.div>
    </motion.section>
  )
}
