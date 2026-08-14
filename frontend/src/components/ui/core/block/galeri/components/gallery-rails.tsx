"use client"

import { Fragment } from "react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/fragments/shadcn-ui/carousel"
import { GALLERY_CATEGORIES } from "../galeri-data"
import type { GalleryItem } from "../types/gallery-types"
import { GalleryCard } from "./gallery-card"

/**
 * GalleryRails — the "Semua" view: one Shadcn `Carousel` (Embla) per category
 * (blueprint §5.3). Compact `aspect-[16/10]` tiles with a mobile peek;
 * Prev/Next round buttons on desktop, native swipe + edge drag on touch.
 * The lightbox scope = the full visible set, so navigation flows across every
 * category in order.
 */
export function GalleryRails({ items }: { items: GalleryItem[] }) {
  const indexById = new Map(items.map((item, index) => [item.id, index]))

  return (
    <div className="flex flex-col gap-16 md:gap-20">
      {GALLERY_CATEGORIES.filter((c) => c.id !== "").map((category) => {
        const categoryItems = items.filter((i) => i.category === category.id)
        if (categoryItems.length === 0) return null

        return (
          <Fragment key={category.id}>
            <section aria-labelledby={`galeri-rail-${category.id}`}>
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
                <h2
                  id={`galeri-rail-${category.id}`}
                  className="font-heading text-[clamp(20px,2.6vw,28px)] leading-tight font-light tracking-[-0.01em] text-foreground"
                >
                  {category.label}
                </h2>
                <p className="text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
                  {category.description}
                </p>
              </div>

              <Carousel
                opts={{ align: "start", containScroll: "trimSnaps" }}
                className="w-full"
              >
                <CarouselContent className="-ml-3">
                  {categoryItems.map((item) => (
                    <CarouselItem
                      key={item.id}
                      className="basis-[72%] pl-3 sm:basis-[40%] md:basis-[30%] lg:basis-[24%] xl:basis-[20%]"
                    >
                      <GalleryCard
                        item={item}
                        index={indexById.get(item.id) ?? 0}
                        scope={items}
                        className="aspect-[16/10] w-full"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden -left-4 border-border bg-background text-foreground shadow-sm hover:bg-muted sm:flex" />
                <CarouselNext className="hidden -right-4 border-border bg-background text-foreground shadow-sm hover:bg-muted sm:flex" />
              </Carousel>
            </section>
          </Fragment>
        )
      })}
    </div>
  )
}
