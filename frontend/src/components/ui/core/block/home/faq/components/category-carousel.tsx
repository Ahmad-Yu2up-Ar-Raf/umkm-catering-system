"use client"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/fragments/shadcn-ui/carousel"
import { cn } from "@/lib/utils"

import type { FaqCategory } from "../faq-data"

/**
 * Mobile category selector — horizontally scrollable carousel of tab buttons.
 *
 * - Reusable: driven entirely by props.
 * - Active tab uses the primary-filled Button variant (shadcn `default`).
 * - `dragFree` + `align: start` gives a native-feeling swipe between tabs.
 */
export function CategoryCarousel({
  categories,
  activeCategory,
  onSelect,
  className,
}: {
  categories: FaqCategory[]
  activeCategory: string
  onSelect: (id: string) => void
  className?: string
}) {
  return (
    <Carousel
      opts={{ align: "start", dragFree: true, containScroll: "trimSnaps" }}
      className={cn("w-full", className)}
    >
      <CarouselContent className="ml-2.5">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id
          return (
            <CarouselItem key={cat.id} className="basis-auto pl-2">
              <Button
                data-faq-cat
                onClick={() => onSelect(cat.id)}
                variant={isActive ? "default" : "outline"}
                aria-pressed={isActive}
                className={cn(
                  "rounded-full text-sm whitespace-nowrap opacity-0",
                  isActive
                    ? "text-primary-foreground"
                    : "border-border bg-input/30 text-muted-foreground hover:bg-input/50 hover:text-foreground"
                )}
              >
                {cat.label}
              </Button>
            </CarouselItem>
          )
        })}
      </CarouselContent>
    </Carousel>
  )
}
