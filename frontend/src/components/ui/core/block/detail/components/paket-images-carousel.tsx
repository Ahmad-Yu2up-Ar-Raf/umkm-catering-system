"use client"

import { useEffect } from "react"
import type { EmblaOptionsType } from "embla-carousel"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  MaximizeIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { useImageModalStore } from "@/store/image-modal-store"

import {
  Carousel,
  Slider,
  SliderContainer,
  SliderDotButton,
  SliderNextButton,
  SliderPrevButton,
  SliderSnapDisplay,
  ThumbsSlider,
  useCarousel,
} from "./image-carousel"

interface PaketImagesCarouselProps {
  /** Normalized, deduped gallery for THIS package (`thumbnail` + `images`). */
  gallery: string[]
  /** Accessible image label — the package name. */
  alt: string
  /** Package name shown as the lightbox caption. */
  modalTitle: string
  /** Category label shown as the lightbox eyebrow. */
  modalCategory?: string
  className?: string
}

/** Glass edge pill — same language as the GlobalImageModal controls. */
const edgeButtonClass =
  "pointer-events-auto absolute top-1/2 z-20 size-11 -translate-y-1/2 rounded-full border border-border bg-background/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"

/**
 * Fullscreen trigger + carousel↔lightbox index sync.
 * - Opens the GLOBAL lightbox (single instance) at the current slide with a
 *   scope built ONLY from this package's gallery.
 * - While the lightbox is open, subscribes to its index and scrolls the
 *   carousel to match — so closing returns to the last-viewed slide.
 */
function FullscreenControl({
  gallery,
  modalTitle,
  modalCategory,
}: {
  gallery: string[]
  modalTitle: string
  modalCategory?: string
}) {
  const { emblaApi, selectedIndex } = useCarousel()
  const isModalOpen = useImageModalStore((s) => s.isOpen)
  const modalIndex = useImageModalStore((s) => s.index)

  useEffect(() => {
    if (isModalOpen && emblaApi) emblaApi.scrollTo(modalIndex)
  }, [isModalOpen, modalIndex, emblaApi])

  const scope = gallery.map((src) => ({
    src,
    title: modalTitle,
    ...(modalCategory ? { category: modalCategory } : {}),
  }))

  return (
    <Button
      type="button"
      size="icon"
      aria-label="Perbesar gambar"
      onClick={() =>
        useImageModalStore.getState().open(scope, Math.min(selectedIndex, gallery.length - 1))
      }
      className="absolute top-4 right-4 z-20 grid size-11 place-items-center rounded-full border border-border bg-background/85 text-foreground shadow-sm backdrop-blur-sm transition-colors duration-300 hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <HugeiconsIcon icon={MaximizeIcon} className="size-5" />
    </Button>
  )
}

/** Desktop overlay: prev/next pills + centered counter. */
function DesktopNav() {
  return (
    <>
      <SliderPrevButton className={edgeButtonClass}>
        <HugeiconsIcon icon={ArrowLeft02Icon} className="size-5" />
      </SliderPrevButton>
      <SliderNextButton className={edgeButtonClass}>
        <HugeiconsIcon icon={ArrowRight02Icon} className="size-5" />
      </SliderNextButton>
      <SliderSnapDisplay className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-background/85 px-3.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm" />
    </>
  )
}

/**
 * The breakpoint-aware image gallery surface for the Paket Detail page.
 *
 * Desktop (lg+): vertical main column + left vertical thumbnail rail,
 * prev/next edge pills, counter, fullscreen. Vertical axis, NO rtl.
 *
 * Mobile: horizontal swipe, dots + counter, fullscreen — no crowded rail.
 */
export function PaketImagesCarousel({
  gallery,
  alt,
  modalTitle,
  modalCategory,
  className,
}: PaketImagesCarouselProps) {
  const isMobile = useIsMobile()
  const options: EmblaOptionsType = isMobile ? {} : { axis: "y" }

  return (
    <Carousel
      options={options}
      className={cn(
        "relative overflow-hidden ",
        className
      )}
    >
      {/* <FullscreenControl
        gallery={gallery}
        modalTitle={modalTitle}
        modalCategory={modalCategory}
      /> */}

      {isMobile ? (
        <div className="relative aspect-[4/3] w-full">
          <SliderContainer className="h-full">
            {gallery.map((src, index) => (
              <Slider key={index} className="h-full basis-full">
                <MediaItem
                  webViewLink={src}
                  alt={alt}
                  className="size-full"
                  imageClassName="size-full object-cover"
                />
              </Slider>
            ))}
          </SliderContainer>
          <SliderSnapDisplay className="absolute right-4 bottom-3 z-20 rounded-full bg-background/85 px-3.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm" />
          <SliderDotButton className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-background/60 px-2 py-1 backdrop-blur-sm" />
        </div>
      ) : (
        <div className="flex h-[min(42em,70svh)] items-stretch gap-3 ">
          <ThumbsSlider
            gallery={gallery}
            className="h-full w-16 md:w-20"
            thumbsClassName="h-full "
          />
          <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl">
            <SliderContainer className="h-full">
              {gallery.map((src, index) => (
                <Slider key={index} className="h-full">
                  <MediaItem
                    webViewLink={src}
                    alt={alt}
                    className="size-full"
                    imageClassName="size-full object-cover"
                  />
                </Slider>
              ))}
            </SliderContainer>
            {/* <DesktopNav /> */}
          </div>
        </div>
      )}
    </Carousel>
  )
}

export default PaketImagesCarousel
