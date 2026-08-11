"use client"

import { Fragment } from "react"

import { GALLERY_CATEGORIES } from "../galeri-data"
import type { GalleryItem } from "../types/gallery-types"
import { GalleryCard } from "./gallery-card"

/**
 * GalleryRails — the "Semua" view: one horizontal cluster rail per category
 * (marquee-card anatomy, spec §3.1 step 4). Native `overflow-x-auto snap-x`
 * scrolling with both-edge gradient masks — no JS carousel in v1. Each tile
 * carries its global index in `items` so the lightbox navigates across the
 * whole visible set in order.
 */
export function GalleryRails({
  items,
  onSelect,
}: {
  items: GalleryItem[]
  onSelect: (index: number) => void
}) {
  const indexById = new Map(items.map((item, index) => [item.id, index]))

  return (
    <div className="flex flex-col gap-12">
      {GALLERY_CATEGORIES.filter((c) => c.id !== "").map((category) => {
        const categoryItems = items.filter((i) => i.category === category.id)
        if (categoryItems.length === 0) return null

        return (
          <Fragment key={category.id}>
            <section aria-labelledby={`galeri-rail-${category.id}`}>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
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

              {/* Native scroll rail with both-edge gradient masks. */}
              <div className="overflow-x-auto pb-2 pt-2 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
                <div className="flex w-max snap-x gap-4">
                  {categoryItems.map((item) => (
                    <GalleryCard
                      key={item.id}
                      item={item}
                      index={indexById.get(item.id) ?? 0}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              </div>
            </section>
          </Fragment>
        )
      })}
    </div>
  )
}
