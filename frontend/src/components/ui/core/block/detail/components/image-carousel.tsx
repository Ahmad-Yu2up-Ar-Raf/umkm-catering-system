"use client"

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
} from "react"
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel"
import useEmblaCarousel from "embla-carousel-react"

import { cn } from "@/lib/utils"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"

/* ============ context ============ */

interface CarouselContextValue {
  emblaApi: EmblaCarouselType | undefined
  emblaThumbsApi: EmblaCarouselType | undefined
  /** Container refs — consumed by SliderContainer / ThumbsSlider. */
  emblaRef: (instance: HTMLDivElement | null) => void
  emblaThumbsRef: (instance: HTMLDivElement | null) => void
  selectedIndex: number
  onThumbClick: (index: number) => void
  carouselId: string
  handleKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void
}

const CarouselContext = createContext<CarouselContextValue | undefined>(
  undefined
)

export const useCarousel = () => {
  const context = useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel>")
  }
  return context
}

/* ============ main carousel ============ */

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  options?: EmblaOptionsType
  plugins?: Parameters<typeof useEmblaCarousel>[1]
}

/**
 * Strictly HORIZONTAL by construction — the axis is force-set to "x" so a
 * consumer can never flip this into a vertical rail (no vertical layout
 * exists in this component anymore).
 */
export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  ({ children, options = {}, plugins = [], className, ...props }, ref) => {
    const carouselId = useId()

    const carouselOptions: EmblaOptionsType = { axis: "x", ...options }
    const [emblaRef, emblaApi] = useEmblaCarousel(carouselOptions, plugins)
    const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
      axis: "x",
      containScroll: "keepSnaps",
      dragFree: true,
    })

    const [selectedIndex, setSelectedIndex] = useState(0)

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
    const onThumbClick = useCallback(
      (index: number) => emblaApi?.scrollTo(index),
      [emblaApi]
    )

    const onSelect = useCallback(() => {
      if (!emblaApi) return
      setSelectedIndex(emblaApi.selectedScrollSnap())
      emblaThumbsApi?.scrollTo(emblaApi.selectedScrollSnap())
    }, [emblaApi, emblaThumbsApi])

    useEffect(() => {
      if (!emblaApi) return

      // Sync React state from the EXTERNAL Embla store. Embla is usually
      // initialized before this effect runs (its 'init' event already fired),
      // so seed once on the next frame; the events keep state in sync after.
      const seed = requestAnimationFrame(onSelect)

      emblaApi.on("select", onSelect).on("reInit", onSelect)

      return () => {
        cancelAnimationFrame(seed)
        emblaApi.off("select", onSelect).off("reInit", onSelect)
      }
    }, [emblaApi, onSelect])

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!emblaApi) return
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        }
        if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [emblaApi, scrollPrev, scrollNext]
    )

    return (
      <CarouselContext.Provider
        value={{
          emblaApi,
          emblaThumbsApi,
          emblaRef,
          emblaThumbsRef,
          selectedIndex,
          onThumbClick,
          carouselId,
          handleKeyDown,
        }}
      >
        <div
          ref={ref}
          tabIndex={0}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative focus:outline-none", className)}
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

/* ============ slide container / slide ============ */

export const SliderContainer = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { emblaRef } = useCarousel()

  return (
    <div ref={emblaRef} className="h-full overflow-hidden" {...props}>
      <div ref={ref} className={cn("flex h-full flex-row", className)}>
        {children}
      </div>
    </div>
  )
})
SliderContainer.displayName = "SliderContainer"

export const Slider = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("min-w-0 shrink-0 grow-0", className)}
      {...props}
    >
      {children}
    </div>
  )
})
Slider.displayName = "Slider"

/* ============ thumbnails (always a horizontal rail) ============ */

interface ThumbsSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The normalized slide set — same order as the main carousel. */
  gallery: string[]
  thumbsClassName?: string
}

export const ThumbsSlider = forwardRef<HTMLDivElement, ThumbsSliderProps>(
  ({ gallery, className, thumbsClassName, ...props }, ref) => {
    const { selectedIndex, onThumbClick, emblaThumbsRef, carouselId } =
      useCarousel()

    if (gallery.length === 0) return null

    return (
      <div
        ref={emblaThumbsRef}
        className={cn("overflow-hidden", className)}
        {...props}
      >
        <div
          ref={ref}
          className={cn("flex flex-row gap-2", thumbsClassName)}
        >
          {gallery.map((src, index) => (
            <button
              key={`${carouselId}-thumb-${index}`}
              type="button"
              onClick={() => onThumbClick(index)}
              aria-label={`Lihat gambar ${index + 1}`}
              aria-current={index === selectedIndex}
              className={cn(
                "relative aspect-[4/3] h-full shrink-0 overflow-hidden rounded-lg transition-[opacity,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                index === selectedIndex
                  ? "opacity-100 ring-primary"
                  : "opacity-55 ring-border hover:opacity-90"
              )}
            >
              <MediaItem
                webViewLink={src}
                alt=""
                unstyled
                className="size-full"
                imageClassName="size-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    )
  }
)
ThumbsSlider.displayName = "ThumbsSlider"
