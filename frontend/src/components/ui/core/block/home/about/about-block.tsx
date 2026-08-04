import { Image } from "@unpic/react"
import React, { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"

type ImageCardProps = {
  src: string
  alt: string
  className?: string
}

function ImageCard({ src, alt, className }: ImageCardProps) {
  return (
    <div
      data-about-img
      className={cn(
        "relative  rounded-lg transition-all duration-300",

        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={300}
        height={400}
        className="h-full w-full object-contain"
      />
    </div>
  )
}

// =============================================================================
// Filosofi SECTION
// =============================================================================

function FilosofiBlock() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  // Scroll-triggered sequential reveal — Hero-consistent easing, once, no
  // reverse-jitter. Hardware-accelerated props only (transform/opacity).
  useGSAP(
    () => {
      if (reduced || !sectionRef.current) return

      const q = gsap.utils.selector(sectionRef.current)
      const eyebrow = q("[data-about-eyebrow]")
      const title = q("[data-about-title]")
      const desc = q("[data-about-desc]")
      const imgs = q("[data-about-img]")

      // Pre-hide (autoAlpha = opacity + visibility) so nothing flashes as the
      // section scrolls in, and suspend the image hover transition during the
      // scale/y tween so it isn't rubber-banded.
      gsap.set([...eyebrow, ...title, ...desc], { autoAlpha: 0 })
      gsap.set(imgs, { autoAlpha: 0 })
      imgs.forEach((el) => {
        ;(el as HTMLElement).style.transition = "none"
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      })

      tl.fromTo(
        eyebrow,
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, ease: "power2.out" }
      )
        .fromTo(
          title,
          { y: 30, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
          },
          "-=0.25"
        )
        .fromTo(
          desc,
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, ease: "power2.out" },
          "-=0.2"
        )
        .fromTo(
          imgs,
          { y: 30, scale: 1.05, autoAlpha: 0 },
          {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.15,
            clearProps: "transform,opacity",
            onComplete: () => {
              imgs.forEach((el) => {
                ;(el as HTMLElement).style.removeProperty("transition")
              })
            },
          },
          "-=0.1"
        )
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="container content-center py-12 sm:min-h-lvh  "
    >
      <div className="flex flex-col gap-13 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        {/* Teks Filosofi Us - Kiri */}
        <header className="flex w-full flex-1 flex-col gap-y-6 md:gap-y-9">
          {/* Judul */}
          <div className="flex w-full flex-col gap-y-1">
            <div>
              <p
                data-about-eyebrow
                className="text-gold-deep mb-6 flex items-center gap-3.5 text-[11px] font-normal tracking-[0.28em] uppercase"
              >
                <div aria-hidden="true" className="h-px w-10 bg-primary" />
                <span className="text-primary">Tentang Kami</span>
              </p>
            </div>
            <h2 className="w-full font-serif text-3xl md:text-4xl md:leading-14 lg:text-5xl">
              <span data-about-title className=" ">
                Setiap perayaan{" "}
              </span>
              <span
                data-about-title
                className="clear-start block font-accent text-primary italic"
              >
                kisah Anda.
              </span>
            </h2>
          </div>

          {/* Deskripsi - lebih singkat */}
          <p
            data-about-desc
            className="text-xs leading-relaxed text-muted-foreground md:text-sm"
          >
            Sejak 2024, Catering Nusantara hadir dari dapur keluarga di Bogor,
            dimasak segar dengan sepenuh hati untuk Anda. Kami percaya hidangan
            terbaik yang membuat tamu Anda merasa diistimewakan dan hangat.
          </p>
        </header>

        {/* Image Container - Kanan (Flex based, controlled size) */}
        <div className="flex w-full items-end justify-center transition-all duration-300 sm:pl-20 lg:w-[50%] ">
          <div className="z-[1] -mr-29 -translate-y-3.5 -rotate-10 transition-all duration-300">
            <ImageCard
              src="assets/images/filosofi/filosofi-1.png"
              alt="Rendang - Kuliner Nusantara"
              className="h-auto w-[190px] md:w-[180px] lg:w-[230px]"
            />
          </div>

          <div className="z-[3] -translate-y-2 transition-all duration-300 md:-translate-y-4">
            <ImageCard
              src="assets/images/filosofi/filosofi-2.png"
              alt="Rumah Gadang - Arsitektur Nusantara"
              className="h-auto w-[190px] md:w-[220px] lg:w-[250px]"
            />
          </div>

          <div className="z-[1] -ml-29 -translate-y-4.5 rotate-10 transition-all duration-300">
            <ImageCard
              src="assets/images/filosofi/filosofi-3.png"
              alt="Batik - Warisan Nusantara"
              className="h-auto w-[190px] md:w-[180px] lg:w-[230px]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default FilosofiBlock
