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
  gallery: string[]
  alt: string
  modalTitle: string
  modalCategory?: string
  className?: string
}

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
      className="group relative flex size-full cursor-zoom-in items-center justify-center bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <MediaItem
        webViewLink={src}
        alt={alt}
        unstyled
        className="flex size-full items-center justify-center bg-muted"
        // Diubah dari h-fit ke h-full w-full object-cover !object-center agar gambar terkunci di tengah kontainer aspect-[4/3]
        imageClassName="h-full w-full object-cover !object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        layout="fullWidth"
        sizes="(min-width: 1024px) 50rem, 90vw"
        priority={priority}
        loading={
          <Skeleton className="absolute inset-0 size-full rounded-none bg-secondary" />
        }
      />
    </button>
  )
}

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

  useEffect(() => {
    if (isModalOpen && mainApi) mainApi.scrollTo(modalIndex)
  }, [isModalOpen, modalIndex, mainApi])

  if (gallery.length === 0) return null

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-4 overflow-hidden md:gap-3",
        className
      )}
    >
      {/* main slider */}
      <div className="relative w-full min-w-0 overflow-hidden px-5 md:p-0">
        <div className="relative aspect-[10/9] w-full overflow-hidden rounded-2xl bg-muted lg:aspect-[16/17]">
          <Carousel
            setApi={setMainApi}
            opts={{ loop: false, axis: "x" }}
            className="size-full min-w-0"
          >
            <CarouselContent className="ml-0 h-full items-center">
              {gallery.map((src, index) => (
                <CarouselItem
                  key={index}
                  className="flex h-full min-w-0 basis-full items-center justify-center pl-0"
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

      {/* thumbnail rail */}
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
                "min-w-0 shrink-0 grow-0 basis-[35%] sm:basis-[28%] md:basis-[24%] lg:basis-[30%]",
                index === 0 ? "pl-5 md:pl-3 md:-ml-3" : "pl-2 md:pl-3"
              )}
            >
              <button
                type="button"
                onClick={() => onThumbClick(index)}
                aria-label={`Lihat gambar ${index + 1}`}
                aria-current={index === selectedIndex}
                className={cn(
                  "relative flex aspect-[2/3] h-17 w-full shrink-0 overflow-hidden rounded-xl transition-opacity duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:h-24",
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
