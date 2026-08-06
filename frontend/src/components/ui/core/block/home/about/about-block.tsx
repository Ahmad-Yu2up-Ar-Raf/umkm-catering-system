import { Image } from "@unpic/react"
import { useRef } from "react"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { BlurReveal } from "@/components/motion/blur-reveal"

type ImageCardProps = {
  src: string
  alt: string
  className?: string
}

function ImageCard({ src, alt, className }: ImageCardProps) {
  return (
    <div className={cn("about-image-item relative rounded-lg", className)}>
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

function AboutBlock() {
  const sectionRef = useRef<HTMLElement>(null)
  const imagesRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  // All THREE images — one zoom-out choreography. The DOM order is
  // [left, center, right]; we resequence an EXPLICIT array as
  // [center, left, right] so the reveal starts from the middle and ripples
  // outward — never a left→right sweep.
  //
  // Trigger semantics (ScrollTrigger): `start: "top 55%"` fires only once the
  // images' TOP EDGE reaches 55% of the viewport height — i.e. the images sit
  // comfortably inside the viewport, NOT just peeking at the bottom. A value
  // like "top 80%" would fire when only the images' top grazes the bottom
  // fifth of the screen, playing the whole cascade before the user scrolls
  // the images into the centre — the premature/fast feel reported.
  useGSAP(
    () => {
      if (reduced || !imagesRef.current) return

      const imgs = gsap.utils.toArray<HTMLElement>(
        ".about-image-item",
        imagesRef.current
      )
      if (!imgs.length) return
      const ordered =
        imgs.length === 3 ? [imgs[1], imgs[0], imgs[2]] : Array.from(imgs)

      gsap.fromTo(
        ordered,
        { opacity: 0, scale: 1.2, filter: "blur(10px)" },
        {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.1,
          ease: "power3.out",
          // Center → left → right, breathing 0.2s between each.
          stagger: 0.2,
          clearProps: "filter",
          scrollTrigger: {
            trigger: imagesRef.current,
            start: "top 55%",
            once: true,
          },
        }
      )
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="tentang-kami"
      className="container content-center py-12   sm:min-h-lvh"
    >
      <div className="flex flex-col gap-13 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        {/* Teks Filosofi Us - Kiri */}
        <header className="flex w-full flex-1 flex-col gap-y-6 md:gap-y-9">
          {/* Judul */}
          <div className="flex w-full flex-col gap-y-1">
            <div>
              <p className="text-gold-deep mb-6 flex items-center gap-3.5 text-[11px] font-normal tracking-[0.28em] uppercase">
                <div aria-hidden="true" className="h-px w-10 bg-primary" />
                <BlurReveal as="span" className="text-primary" amount={0.3}>
                  Tentang Kami
                </BlurReveal>
              </p>
            </div>
            <h2 className="w-full font-serif text-3xl md:text-4xl md:leading-14 lg:text-5xl">
              <BlurReveal
                as="span"
                className="block"
                stagger={0.08}
                amount={0.3}
              >
                Setiap perayaan
              </BlurReveal>
              <BlurReveal
                as="span"
                className="block font-accent text-primary italic"
                stagger={0.08}
                amount={0.3}
              >
                kisah Anda.
              </BlurReveal>
            </h2>
          </div>

          {/* Deskripsi - lebih singkat */}
          <BlurReveal
            as="p"
            className="text-xs leading-relaxed text-muted-foreground md:text-sm"
            amount={0.3}
          >
            Sejak 2024, Catering Nusantara hadir dari dapur keluarga di Bogor,
            dimasak segar dengan sepenuh hati untuk Anda. Kami percaya hidangan
            terbaik yang membuat tamu Anda merasa diistimewakan dan hangat.
          </BlurReveal>
        </header>

        {/* Image Container - Kanan (Flex based, controlled size) */}
        <div
          ref={imagesRef}
          className="flex w-full items-end justify-center transition-all duration-300 sm:pl-20 lg:w-[50%]"
        >
          <div className="z-[1] -mr-29 -translate-y-3.5 -rotate-10 transition-all duration-300">
            <ImageCard
              src="assets/images/about/about-1.png"
              alt="Rendang - Kuliner Nusantara"
              className="h-auto w-[190px] md:w-[180px] lg:w-[230px]"
            />
          </div>

          <div className="z-[3] -translate-y-2 transition-all duration-300 md:-translate-y-4">
            <ImageCard
              src="assets/images/about/about-2.png"
              alt="Rumah Gadang - Arsitektur Nusantara"
              className="h-auto w-[190px] md:w-[220px] lg:w-[250px]"
            />
          </div>

          <div className="z-[1] -ml-29 -translate-y-4.5 rotate-10 transition-all duration-300">
            <ImageCard
              src="assets/images/about/about-3.png"
              alt="Batik - Warisan Nusantara"
              className="h-auto w-[190px] md:w-[180px] lg:w-[230px]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutBlock
