"use client"
import React, { useEffect, useRef, useState } from "react"
import { Image } from "@unpic/react"

import { cn } from "@/lib/utils"
import { Spinner } from "../shadcn-ui/spinner"

const MediaItem = ({
  webViewLink,
  className,
  imageClassName,
  mediaType = "image",
  onClick,
  style,
  onImageLoaded,
  onError,
  alt,
  width = 1280,
  height = 960,
  layout = "constrained",
  objectFit = "cover",
  unstyled = false,
  loading,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
}: {
  webViewLink: string
  mediaType?: "image" | "video"
  className?: string
  imageClassName?: string
  onClick?: () => void
  style?: React.CSSProperties
  /** Report the image's NATURAL dimensions once loaded (used by masonry
   *  layout to size cards to the real intrinsic ratio, not a forced box). */
  onImageLoaded?: (width: number, height: number) => void
  /** Optional accessible label — falls back to the src URL (current default).
   *  Pass an empty string for purely decorative imagery. */
  alt?: string
  /** Image load failure handler (fallback UX). */
  onError?: () => void
  /**
   * @unpic layout. `constrained` (default) lets @unpic bake a `w_,h_` Cloudinary
   * pre-crop — use it for intentionally ratio-locked boxes (package cards,
   * fixed-ratio carousels). `fullWidth` delivers width-responsive candidates
   * that PRESERVE the image's natural aspect ratio (no `h_`, no `c_lfill`
   * crop) — use it for surfaces that must keep the original composition
   * (gallery masonry, lightbox). In `fullWidth` the `width`/`height` props
   * are ignored and the `sizes` hint decides which candidate loads.
   */
  layout?: "constrained" | "fullWidth"
  /** Media box width for the `constrained` layout (srcset "1x" size). Default 1280. */
  width?: number
  /** Media box height for the `constrained` layout (aspect of the pre-crop). Default 960. */
  height?: number
  /**
   * `object-fit` — forwarded into @unpic's computed style (inline wins over
   * the `imageClassName` classes). "cover" fills a box (cards), "contain"
   * preserves the full frame (lightbox).
   */
  objectFit?: "cover" | "contain"
  /**
   * Skip @unpic's inline layout styles (max-width/max-height/object-fit) so
   * the `imageClassName` classes fully control the element. Use for layouts
   * that need precise class-driven sizing (the lightbox).
   */
  unstyled?: boolean
  /**
   * Browser `sizes` hint (srcset candidate selection). Override for surfaces
   * where the image occupies more than the default card footprint — e.g. the
   * fullscreen lightbox (`"90vw"`).
   */
  sizes?: string
  /**
   * Replace the default loading overlay (dark panel + spinner). Pass a
   * container from the project primitives (e.g. a `Skeleton`) that fills the
   * image box — `false` hides the overlay entirely for surfaces that render
   * their own loading UI (the lightbox).
   */
  loading?: React.ReactNode | false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [isBuffering, setIsBuffering] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  // Per-image loading lifecycle: when `webViewLink` changes (carousel slides,
  // lightbox prev/next, gallery row reuse) the previous image's ready/error
  // state MUST NOT leak into the new image. Reset synchronously during render
  // (React's "adjust state from previous render" pattern) so the loading UI
  // reflects the CURRENT asset only — an effect would let the stale state
  // paint for one frame.
  const [prevLink, setPrevLink] = useState(webViewLink)
  if (prevLink !== webViewLink) {
    setPrevLink(webViewLink)
    setImageLoaded(false)
    setErrored(false)
  }

  // Intersection Observer untuk video
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "50px",
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsInView(entry.isIntersecting)
      })
    }, options)

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current)
      }
    }
  }, [])

  // Handle video play/pause
  useEffect(() => {
    let mounted = true

    const handleVideoPlay = async () => {
      if (!videoRef.current || !isInView || !mounted) return

      try {
        if (videoRef.current.readyState >= 3) {
          setIsBuffering(false)
          await videoRef.current.play()
        } else {
          setIsBuffering(true)
          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.oncanplay = resolve
            }
          })
          if (mounted) {
            setIsBuffering(false)
            await videoRef.current.play()
          }
        }
      } catch (error) {
        console.warn("Video playback failed:", error)
      }
    }

    if (isInView) {
      handleVideoPlay()
    } else if (videoRef.current) {
      videoRef.current.pause()
    }

    return () => {
      mounted = false
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.removeAttribute("src")
        videoRef.current.load()
      }
    }
  }, [isInView])

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement>
  ) => {
    setImageLoaded(true)
    const img = e.currentTarget
    onImageLoaded?.(img.naturalWidth, img.naturalHeight)
  }

  const handleImageError = () => {
    // Stop the spinner/skeleton: a failed image must not LOOK like a loading
    // image forever. The consumer's `onError` decides what replaces it.
    setErrored(true)
    onError?.()
  }

  if (mediaType === "video") {
    return (
      <div
        className={cn(`relative w-full overflow-hidden`, className)}
        style={style}
      >
        <video
          ref={videoRef}
          className={cn(
            "relative inset-0 h-full w-full object-cover object-top",
            // Disable hover effects on iOS
            imageClassName
          )}
          onClick={onClick}
          playsInline
          muted
          loop
          preload="auto"
          style={{
            opacity: isBuffering ? 0.8 : 1,
            transition: "opacity 0.2s",
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        >
          <source src={webViewLink} type="video/mp4" />
        </video>
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-accent-foreground/10">
            <Spinner className="h-6 w-6 rounded-xl text-accent" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        `relative flex h-full w-full justify-center overflow-hidden`,
        className
      )}
      style={style}
    >
      <Image
        src={webViewLink}
        alt={alt ?? webViewLink}
        onError={handleImageError}
        className={cn(
          "h-full w-full overflow-hidden object-cover",
          imageClassName
        )}
        onClick={onClick}
        {...(layout === "fullWidth"
          ? { layout: "fullWidth" as const }
          : { width, height, layout: "constrained" as const })}
        objectFit={objectFit}
        unstyled={unstyled}
        role="img"
        loading="lazy"
        onLoad={handleImageLoad}
        sizes={sizes}
      />
      {!imageLoaded && !errored && (loading ?? (
        <div className="absolute inset-0 flex items-center justify-center bg-accent-foreground">
          <Spinner className="h-6 w-6 rounded-xl text-accent" />
        </div>
      ))}
    </div>
  )
}

export default MediaItem
