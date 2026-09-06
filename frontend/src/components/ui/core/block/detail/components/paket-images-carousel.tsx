"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/fragments/shadcn-ui/carousel"
import { useImageModalStore } from "@/store/image-modal-store"

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

/** One slide — the image itself IS the lightbox trigger. */
function LightboxSlide({
  src,
  alt,
  index,
  scope,
  priority = false,
}: {
  src: string
  alt: string
  index: number
  scope: { src: string; title: string; category?: string }[]
  priority?: boolean
}) {
  return (
    <button
      type="button"
      aria-label="Perbesar gambar"
      onClick={() => useImageModalStore.getState().open(scope, index)}
      className="group relative  block size-full cursor-zoom-in focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <MediaItem
        webViewLink={src}
        alt={alt}
        className="size-full"
        imageClassName="size-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        layout="fullWidth"
        sizes="(min-width: 1024px) 50rem, 90vw"
        priority={priority}
        loading={
          <Skeleton className="absolute inset-0 h-full w-full rounded-none bg-secondary" />
        }
      />
    </button>
  )
}

/**
 * Breakpoint-aware gallery: main slider on top, horizontal thumbnail rail below.
 * Uses two shadcn Carousel instances synced via setApi.
 *
 * Mobile bleed: thumbnail rail wrapper has px-0; first thumb gets pl-4 on mobile
 * (md:pl-2) so it aligns with the padded content above, while the rest use pl-2
 * and bleed to the viewport edge when swiped.
 *
 * Mobile scale: main aspect is taller on mobile (aspect-[4/5]) for immersive
 * vertical impact, desktop stays lg:aspect-[16/17]; thumbnails are widened
 * (basis-[38%]) and taller (h-20) for comfortable touch targets.
 *
 * Grid safety: ancestors use min-w-0 only (no overflow-hidden) to preserve
 * lg:sticky; overflow-hidden is confined to inner carousel descendants.
 */
export function PaketImagesCarousel({
  gallery,
  alt,
  modalTitle,
  modalCategory,
  className,
}: PaketImagesCarouselProps) {
  const [mainApi, setMainApi] = useState<CarouselApi>()
  const [thumbApi, setThumbApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const isModalOpen = useImageModalStore((s) => s.isOpen)
  const modalIndex = useImageModalStore((s) => s.index)

  const scope = useMemo(
    () =>
      gallery.map((src) => ({
        src,
        title: modalTitle,
        ...(modalCategory ? { category: modalCategory } : {}),
      })),
    [gallery, modalTitle, modalCategory]
  )

  const onThumbClick = useCallback(
    (index: number) => mainApi?.scrollTo(index),
    [mainApi]
  )

  // Main -> thumbs sync + selected state
  useEffect(() => {
    if (!mainApi) return
    const onSelect = () => {
      const idx = mainApi.selectedScrollSnap()
      setSelectedIndex(idx)
      thumbApi?.scrollTo(idx)
    }
    onSelect()
    mainApi.on("select", onSelect).on("reInit", onSelect)
    return () => {
      mainApi.off("select", onSelect).off("reInit", onSelect)
    }
  }, [mainApi, thumbApi])

  // Lightbox -> carousel sync: closing returns to last-viewed image
  useEffect(() => {
    if (isModalOpen && mainApi) mainApi.scrollTo(modalIndex)
  }, [isModalOpen, modalIndex, mainApi])

  if (gallery.length === 0) return null

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col overflow-hidden md:gap-3",
        className
      )}
    >
      {/* main slider — taller on mobile for immersive impact */}
      <div className="relative w-full min-w-0 overflow-hidden p-4 md:p-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl lg:aspect-[16/17]">
          <Carousel
            setApi={setMainApi}
            opts={{ loop: false, axis: "x" }}
            className="size-full min-w-0"
          >
            <CarouselContent className="ml-0 h-full">
              {gallery.map((src, index) => (
                <CarouselItem
                  key={index}
                  className="h-full min-w-0 basis-full pl-0"
                >
                  <LightboxSlide
                    src={src}
                    alt={alt}
                    index={index}
                    scope={scope}
                    priority={index === 0}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>

      {/* thumbnail rail — bleeds to viewport edge on mobile, wider basis */}
      <Carousel
        setApi={setThumbApi}
        opts={{ containScroll: "keepSnaps", dragFree: true, axis: "x" }}
        className="w-full min-w-0 px-0"
      >
        <CarouselContent className="ml-0">
          {gallery.map((src, index) => (
            <CarouselItem
              key={`thumb-${index}`}
              className={cn(
                "min-w-0 shrink-0 grow-0 basis-[35%] sm:basis-[28%] md:basis-[24%] lg:basis-[24%]",
                index === 0 ? "pl-4 md:pl-2" : "pl-2"
              )}
            >
              <button
                type="button"
                onClick={() => onThumbClick(index)}
                aria-label={`Lihat gambar ${index + 1}`}
                aria-current={index === selectedIndex}
                className={cn(
                  "relative flex aspect-[4/3] h-20 w-full shrink-0 overflow-hidden rounded-xl transition-opacity duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:h-24",
                  index === selectedIndex
                    ? "opacity-100"
                    : "opacity-40 hover:opacity-80"
                )}
              >
                <MediaItem
                  webViewLink={src}
                  alt=""
                  unstyled
                  width={200}
                  height={150}
                  sizes="120px"
                  className="size-full"
                  imageClassName="size-full object-cover object-center"
                />
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

export default PaketImagesCarousel
