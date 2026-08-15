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

  return (
    <motion.section
      aria-labelledby={headingId}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={sectionVariants}
    >
      <motion.div
        variants={lineVariants}
        className="mb-5 flex flex-wrap items-baseline justify-between gap-2"
      >
        <h2
          id={headingId}
          className="font-heading text-[clamp(20px,2.6vw,28px)] leading-tight font-light tracking-[-0.01em] text-foreground"
        >
          {category.label}
        </h2>

        <Link
          to={`/galeri/${category.slug}`}
          className={cn(
            "group inline-flex items-center gap-1.5 text-[11px] tracking-[0.22em] text-primary uppercase",
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
                className="aspect-[16/10] basis-[72%] shrink-0 rounded-2xl sm:basis-[40%] md:basis-[30%] lg:basis-[24%]"
              />
            ))}
          </div>
        ) : items.length === 0 ? null : (
          <Carousel
            opts={{ align: "start", containScroll: "trimSnaps" }}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {items.map((item, index) => (
                <CarouselItem
                  key={item.id}
                  className="basis-[72%] pl-3 sm:basis-[40%] md:basis-[30%] lg:basis-[24%]"
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
            <CarouselPrevious className="hidden -left-4 border-border bg-background text-foreground shadow-sm hover:bg-muted sm:flex" />
            <CarouselNext className="hidden -right-4 border-border bg-background text-foreground shadow-sm hover:bg-muted sm:flex" />
          </Carousel>
        )}
      </motion.div>
    </motion.section>
  )
}