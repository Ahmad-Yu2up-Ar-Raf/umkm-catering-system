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

import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

/** Luxury ease — premium Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/* ============ context ============ */

interface CarouselContextValue {
  emblaApi: EmblaCarouselType | undefined
  emblaThumbsApi: EmblaCarouselType | undefined
  /** Container refs — consumed by SliderContainer / ThumbsSlider. */
  emblaRef: (instance: HTMLDivElement | null) => void
  emblaThumbsRef: (instance: HTMLDivElement | null) => void
  prevBtnDisabled: boolean
  nextBtnDisabled: boolean
  onPrevButtonClick: () => void
  onNextButtonClick: () => void
  selectedIndex: number
  scrollSnaps: number[]
  onDotButtonClick: (index: number) => void
  selectedSnap: number
  snapCount: number
  onThumbClick: (index: number) => void
  carouselId: string
  orientation: "vertical" | "horizontal"
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

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  ({ children, options = {}, plugins = [], className, ...props }, ref) => {
    const carouselId = useId()
    const orientation = options.axis === "y" ? "vertical" : "horizontal"

    const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins)
    const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
      containScroll: "keepSnaps",
      dragFree: true,
      ...(orientation === "vertical" ? { axis: "y" as const } : {}),
    })

    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

    const onPrevButtonClick = useCallback(
      () => emblaApi?.scrollPrev(),
      [emblaApi]
    )
    const onNextButtonClick = useCallback(
      () => emblaApi?.scrollNext(),
      [emblaApi]
    )
    const onDotButtonClick = useCallback(
      (index: number) => emblaApi?.scrollTo(index),
      [emblaApi]
    )
    const onThumbClick = useCallback(
      (index: number) => emblaApi?.scrollTo(index),
      [emblaApi]
    )

    const onSelect = useCallback(() => {
      if (!emblaApi) return
      setSelectedIndex(emblaApi.selectedScrollSnap())
      setPrevBtnDisabled(!emblaApi.canScrollPrev())
      setNextBtnDisabled(!emblaApi.canScrollNext())
      emblaThumbsApi?.scrollTo(emblaApi.selectedScrollSnap())
    }, [emblaApi, emblaThumbsApi])

    useEffect(() => {
      if (!emblaApi) return

      // Sync React state from the EXTERNAL Embla store. Embla is usually
      // initialized before this effect runs (its 'init' event already fired),
      // so seed once on the next frame; the events keep state in sync after.
      const sync = () => {
        setScrollSnaps(emblaApi.scrollSnapList())
        onSelect()
      }
      const seed = requestAnimationFrame(sync)

      emblaApi.on("select", sync).on("reInit", sync)

      return () => {
        cancelAnimationFrame(seed)
        emblaApi.off("select", sync).off("reInit", sync)
      }
    }, [emblaApi, onSelect])

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!emblaApi) return
        if (orientation === "vertical") {
          if (event.key === "ArrowUp") {
            event.preventDefault()
            onPrevButtonClick()
          }
          if (event.key === "ArrowDown") {
            event.preventDefault()
            onNextButtonClick()
          }
        } else {
          if (event.key === "ArrowLeft") {
            event.preventDefault()
            onPrevButtonClick()
          }
          if (event.key === "ArrowRight") {
            event.preventDefault()
            onNextButtonClick()
          }
        }
      },
      [emblaApi, orientation, onPrevButtonClick, onNextButtonClick]
    )

    return (
      <CarouselContext.Provider
        value={{
          emblaApi,
          emblaThumbsApi,
          emblaRef,
          emblaThumbsRef,
          prevBtnDisabled,
          nextBtnDisabled,
          onPrevButtonClick,
          onNextButtonClick,
          selectedIndex,
          scrollSnaps,
          onDotButtonClick,
          selectedSnap: selectedIndex,
          snapCount: scrollSnaps.length,
          onThumbClick,
          carouselId,
          orientation,
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
  const { emblaRef, orientation } = useCarousel()

  return (
    <div ref={emblaRef} className="h-full overflow-hidden" {...props}>
      <div
        ref={ref}
        className={cn(
          "flex h-full",
          orientation === "vertical" ? "flex-col" : "flex-row",
          className
        )}
      >
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
  const { orientation } = useCarousel()

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

/* ============ navigation ============ */

export const SliderPrevButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, ...props }, ref) => {
  const { onPrevButtonClick, prevBtnDisabled } = useCarousel()

  return (
    <Button
      ref={ref}
      type="button"
      onClick={onPrevButtonClick}
      disabled={prevBtnDisabled}
      aria-label="Sebelumnya"
      className={cn("", className)}
      {...props}
    >
      {children}
    </Button>
  )
})
SliderPrevButton.displayName = "SliderPrevButton"

export const SliderNextButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, ...props }, ref) => {
  const { onNextButtonClick, nextBtnDisabled } = useCarousel()

  return (
    <Button
      ref={ref}
      type="button"
      onClick={onNextButtonClick}
      disabled={nextBtnDisabled}
      aria-label="Berikutnya"
      className={cn("", className)}
      {...props}
    >
      {children}
    </Button>
  )
})
SliderNextButton.displayName = "SliderNextButton"

/* ============ counter ============ */

export const SliderSnapDisplay = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { selectedSnap, snapCount } = useCarousel()
  const reduced = useReducedMotion()
  // React-sanctioned "adjust state during render" (same pattern as PaketGrid):
  // the direction is derived from the snap change, never set in an effect.
  const [state, setState] = useState({ snap: selectedSnap, direction: 1 })
  if (state.snap !== selectedSnap) {
    setState({
      snap: selectedSnap,
      direction: selectedSnap > state.snap ? 1 : -1,
    })
  }
  const direction = state.direction

  return (
    <div
      ref={ref}
      aria-live="polite"
      className={cn("flex items-baseline gap-1 text-sm font-medium", className)}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={selectedSnap}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: direction * 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: direction * -8 }}
          transition={{ duration: 0.25, ease: LUXURY_EASE }}
          className="tabular-nums"
        >
          {selectedSnap + 1}
        </motion.span>
      </AnimatePresence>
      <span aria-hidden="true" className="text-muted-foreground">
        / {snapCount}
      </span>
    </div>
  )
})
SliderSnapDisplay.displayName = "SliderSnapDisplay"

/* ============ dots ============ */

interface SliderDotButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  activeClass?: string
}

export const SliderDotButton = forwardRef<HTMLDivElement, SliderDotButtonProps>(
  ({ className, activeClass, ...props }, ref) => {
    const { selectedIndex, scrollSnaps, onDotButtonClick } = useCarousel()

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1.5", className)}
        {...props}
      >
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onDotButtonClick(index)}
            aria-label={`Ke gambar ${index + 1}`}
            aria-current={index === selectedIndex}
            className="grid size-5 place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === selectedIndex
                  ? "w-6 bg-primary"
                  : "w-2 bg-primary/40",
                activeClass
              )}
            />
          </button>
        ))}
      </div>
    )
  }
)
SliderDotButton.displayName = "SliderDotButton"

/* ============ thumbnails ============ */

interface ThumbsSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The normalized slide set — same order as the main carousel. */
  gallery: string[]
  thumbsClassName?: string
}

export const ThumbsSlider = forwardRef<HTMLDivElement, ThumbsSliderProps>(
  ({ gallery, className, thumbsClassName, ...props }, ref) => {
    const {
      selectedIndex,
      onThumbClick,
      orientation,
      emblaThumbsRef,
      carouselId,
    } = useCarousel()

    if (gallery.length === 0) return null

    return (
      <div
        ref={emblaThumbsRef}
        className={cn("overflow-hidden", className)}
        {...props}
      >
        <div
          ref={ref}
          className={cn(
            "flex gap-2",
            orientation === "vertical" ? "flex-col" : "flex-row",
            thumbsClassName
          )}
        >
          {gallery.map((src, index) => (
            <button
              key={`${carouselId}-thumb-${index}`}
              type="button"
              onClick={() => onThumbClick(index)}
              aria-label={`Lihat gambar ${index + 1}`}
              aria-current={index === selectedIndex}
              className={cn(
                "relative shrink-0 overflow-hidden rounded-lg rounded-xl ring-1 transition-[opacity,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                orientation === "vertical"
                  ? "aspect-[3/4] w-14 md:w-20"
                  : "aspect-[4/3] h-16",
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
