"use client"

import { useEffect, useMemo } from "react"

import { cn } from "@/lib/utils"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import { useImageModalStore } from "@/store/image-modal-store"

import {
  Carousel,
  Slider,
  SliderContainer,
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

/**
 * Carousel ↔ lightbox index sync: while the GLOBAL lightbox is open, the
 * carousel follows whatever index the modal lands on — so closing returns
 * the slider to the last-viewed image.
 */
function LightboxSync() {
  const { emblaApi } = useCarousel()
  const isModalOpen = useImageModalStore((s) => s.isOpen)
  const modalIndex = useImageModalStore((s) => s.index)

  useEffect(() => {
    if (isModalOpen && emblaApi) emblaApi.scrollTo(modalIndex)
  }, [isModalOpen, modalIndex, emblaApi])

  return null
}

/** One slide — the image itself IS the lightbox trigger (keyboard-accessible
 *  button) with a subtle hover scale. High-res, responsive `fullWidth`
 *  delivery (natural aspect, width candidates) is gracefully fitted into the
 *  fixed hero box by `object-cover`. */
function LightboxSlide({
  src,
  alt,
  index,
  scope,
}: {
  src: string
  alt: string
  index: number
  scope: { src: string; title: string; category?: string }[]
}) {
  return (
    <button
      type="button"
      aria-label="Perbesar gambar"
      onClick={() => useImageModalStore.getState().open(scope, index)}
      className="group relative block size-full cursor-zoom-in focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <MediaItem
        webViewLink={src}
        alt={alt}
        className="size-full"
        imageClassName="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        layout="fullWidth"
        sizes="(min-width: 1024px) 50rem, 90vw"
        loading={
          <Skeleton className="absolute inset-0 h-full w-full rounded-none bg-secondary" />
        }
      />
    </button>
  )
}

/**
 * The breakpoint-aware image gallery surface for the Paket Detail page.
 *
 * Minimalist: main image slider on top, horizontal thumbnail rail directly
 * BELOW it (one layout for every breakpoint). The main image itself opens
 * the global lightbox; navigation relies on swipe/drag + thumb clicks —
 * no on-image prev/next chrome.
 *
 * Layout stability: the hero container is a STRICT fixed ratio (`4:3` mobile,
 * `16:10` desktop). Slides of any source aspect ratio are delivered at high
 * resolution (`fullWidth`) and `object-cover`-fitted into that box, so the
 * page never jumps or reflows when navigating between photos.
 */
export function PaketImagesCarousel({
  gallery,
  alt,
  modalTitle,
  modalCategory,
  className,
}: PaketImagesCarouselProps) {
  const scope = useMemo(
    () =>
      gallery.map((src) => ({
        src,
        title: modalTitle,
        ...(modalCategory ? { category: modalCategory } : {}),
      })),
    [gallery, modalTitle, modalCategory]
  )

  return (
    <Carousel
      options={{ axis: "x" }}
      className={cn("relative w-full", className)}
    >
      <LightboxSync />

      <div className="flex w-full flex-col gap-3">
        {/* main slider — FIXED aspect container, never reflows between slides */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl lg:aspect-[16/17]">
          <SliderContainer className="h-full">
            {gallery.map((src, index) => (
              <Slider key={index} className="h-full basis-full">
                <LightboxSlide
                  src={src}
                  alt={alt}
                  index={index}
                  scope={scope}
                />
              </Slider>
            ))}
          </SliderContainer>
        </div>

        {/* horizontal thumbnail rail — directly below the main slider */}
        <ThumbsSlider
          gallery={gallery}
          className="w-full"
          thumbsClassName="h-16 md:h-24"
        />
      </div>
    </Carousel>
  )
}

export default PaketImagesCarousel
