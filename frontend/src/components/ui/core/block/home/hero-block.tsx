import { useRef } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { OriginButton } from "./components/cta-button"
import { WordReveal } from "@/components/motion/word-reveal"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight } from "@hugeicons/core-free-icons"
import Floating, { FloatingElement } from "./components/paralax-floating"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
/* Hallmark · pre-emit critique: P4 H4 E4 S4 R4 V4 */

/**
 * S1 — Hero "Cita Rasa Rumah" (HOMEPAGE_BUILD §3 S1, revised per owner review).
 * Full-bleed banner + warm cream scrims (text zone fully legible in light mode),
 * two-line fluid display headline with one italic accent word, single primary
 * WhatsApp CTA, and a GSAP-bounced scroll indicator.
 *
 * Motion (HOMEPAGE_BUILD §5): bg parallax yPercent −8→8 scrub, word-mask 0.9s /
 * stagger 0.06s after the curtain, eyebrow/CTA fade 0.3s, scroll-dot bounce
 * (owner-approved infinite yoyo — deliberate exception to design.md §7).
 */
export function HeroBlock() {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const scrollDotRef = useRef<SVGCircleElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced || !sectionRef.current) return

      // Background parallax — scrub, not once (HOMEPAGE_BUILD §5).
      gsap.fromTo(
        bgRef.current,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      )

      // Eyebrow / sub / CTA — one calm fade as the curtain lifts.
      gsap.fromTo(
        sectionRef.current.querySelectorAll("[data-fade]"),
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power1.out", delay: 1.15 }
      )

      // Scroll-dot bounce — user-specified; the hero's signature micro-motion.
      if (scrollDotRef.current) {
        gsap.to(scrollDotRef.current, {
          y: 8,
          duration: 0.7,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
        })
      }
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="beranda"
      className="relative flex min-h-lvh items-center justify-center overflow-hidden"
    >
      <Floating sensitivity={-0.5} className="h-full">
        <FloatingElement depth={1} className="top-[0%] left-[3%]">
          <div
            className="relative h-36 w-35 -rotate-12 overflow-hidden rounded-xl object-cover shadow-2xl transition-transform duration-200 hover:scale-105 sm:h-36 sm:w-48 md:h-44 md:w-56 lg:h-67 lg:w-55"
            // Use will-change sparingly
            style={{ willChange: "transform, opacity" }}
          >
            <MediaItem
              className="h-full w-full cursor-zoom-in"

              webViewLink={
                "/assets/images/products/ai-generated/paket-combo-1.png"
              }
            />
          </div>
        </FloatingElement>

        <FloatingElement
          depth={4}
          className="top-[85%] left-[3%] md:top-[80%] md:left-[8%]"
        >
          <div
            className="relative h-40 w-40 -rotate-[4deg] overflow-hidden rounded-xl object-cover shadow-2xl transition-transform duration-200 hover:scale-105 sm:h-48 sm:w-48 md:h-60 md:w-60 lg:h-67 lg:w-55"
            style={{ willChange: "transform, opacity" }}
          >
            <MediaItem
              className="h-full w-full cursor-zoom-in"

              webViewLink={
                "/assets/images/products/ai-generated/wedding.png"
              }
            />
          </div>
        </FloatingElement>

        <FloatingElement
          depth={2}
          className="top-[0%] left-[68%] md:top-[2%] md:left-[89%]"
        >
          <div
            className="h-36 w-40 rotate-12 overflow-hidden rounded-xl object-cover shadow-2xl transition-transform duration-200 hover:scale-105 sm:h-44 sm:w-48 md:h-52 md:w-60 lg:h-67 lg:w-55"
            style={{ willChange: "transform, opacity" }}
          >
            <MediaItem
              className="h-full w-full cursor-zoom-in"

              webViewLink={
                "/assets/images/products/ai-generated/paket-ulang-tahun.png"
              }
            />
          </div>
        </FloatingElement>

        <FloatingElement
          depth={1}
          className="top-[80%] left-[70%] md:top-[68%] md:left-[85%]"
        >
          <div
            className="h-44 w-44 rotate-[4deg] overflow-hidden rounded-xl object-cover shadow-2xl transition-transform duration-200 hover:scale-105 sm:h-64 sm:w-64 md:h-72 md:w-72 lg:h-67 lg:w-55"
            style={{ willChange: "transform, opacity" }}
          >
            <MediaItem
              className="h-full w-full cursor-zoom-in"

              webViewLink={"/assets/images/products/ai-generated/kantor-3.png"}
            />
          </div>
        </FloatingElement>
      </Floating>
      {/* Full-bleed banner — scaled for parallax headroom (design.md §10.1 #6 hero). */}
      <div ref={bgRef} className="absolute inset-0 -z-10 scale-110">
        <img
          src="/assets/images/banners/hero-banner-tumpeng.png"
          alt="Tumpeng Catering Nusantara untuk perayaan syukuran"
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      {/* Warm cream scrims (contrast fix): photo reads at the edges, the text
          zone sits on solid warm cream so dark-brown copy is fully legible. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 via-background/30 to-background"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(72%_64%_at_50%_44%,var(--background)_0%,transparent_72%)]"
      />

      <div className="relative flex w-full flex-col items-center justify-center gap-1 px-7 py-24 text-center sm:px-6">
        <div
          data-fade
          className="relative mb-7 flex w-full max-w-xs items-center gap-4 text-xs tracking-[0.34em] text-primary uppercase sm:max-w-md"
        >
          <div aria-hidden="true" className="h-px w-full flex-1 bg-primary" />
          <p className="flex w-fit flex-col text-[10px] sm:flex-row sm:gap-2 sm:text-xs">
            <span className="">Catering Service</span>
            <span className="hidden sm:inline"> · </span>
            <span>Sejak 2024</span>
          </p>

          <div aria-hidden="true" className="h-px w-full flex-1 bg-primary" />
        </div>

        <h1 className="min-w-0 text-[clamp(50px,7vw,120px)] leading-[1.05] font-light tracking-tighter text-balance text-foreground">
          <span className="block">
            <WordReveal
              text="Celebrate *love* with the"
              className="gap-"
              delay={0.85}
            />
          </span>
          <span className="block">
            <WordReveal text="*finest* *flavours*" delay={1.0} />
          </span>
        </h1>

        <p
          data-fade
          className="mt-[38px] mb-10 max-w-[590px] text-[clamp(14px,1.6vw,18.3px)] leading-[1.7] text-foreground/80"
        >
          Tiga generasi menghadirkan rasa istimewa untuk perayaan Anda — di
          Bogor, Jakarta, dan sekitarnya.
        </p>

        <OriginButton className="group text-xs tracking-widest uppercase">
          Jelajahi Menu
          <HugeiconsIcon
            icon={ArrowRight}
            className="stroke-primtext-primary z-[9] size-4 fill-none transition-all duration-[800ms] ease-out group-hover:left-4 group-hover:translate-x-1 group-hover:stroke-white"
          />
        </OriginButton>
      </div>
      {/* <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 transform justify-center rounded-full border  border-primary  p-1.5 hover:bg-muted-foreground/25">
        <div className="mx-auto mt-4 size-1.5 animate-bounce rounded-full bg-primary text-2xl text-accent-foreground/90" />
      </div> */}
      {/* Scroll indicator — owner-specified SVG, bounced via GSAP. */}
      {/* <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[34px] left-1/2 -translate-x-1/2 text-primary"
      >
        <svg width="22" height="34" viewBox="0 0 22 34" fill="none">
          <rect
            x="1"
            y="1"
            width="20"
            height="32"
            rx="10"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle ref={scrollDotRef} cx="11" cy="10" r="2.5" fill="currentColor" />
        </svg>
      </div> */}
    </section>
  )
}

export function Marque() {
  return (
    <section className="relative mb-20 w-full content-center md:mb-26">
      {/*
        Marquee background panels using a repeating songket image.
        - Uses a single background image that repeats horizontally (`repeat-x`).
        - The inner bar is made very wide so the existing translate animation
          (`animate-infinite-scroll` / `animate-infinite-scroll-rigth`) creates
          a continuous moving fabric effect without many image nodes.
        - Ensure the asset exists at `/assets/images/songket-repeat.jpg` (seamless tile).
      */}
      <div className="absolute top-0 -right-1 w-[120dvw] -rotate-7 overflow-hidden md:-rotate-3">
        <div
          className="animate-songket-scroll h-12 w-[240dvw] bg-repeat-x will-change-transform md:h-16 lg:h-20"
          style={{
            backgroundImage: "url('/assets/images/patern/songket2.jpg')",
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            backgroundPosition: "0 50%",
            animation: "songketScroll 25s linear infinite",
          }}
        />
      </div>

      <div className="absolute top-0 -right-1 w-[120dvw] rotate-7 overflow-hidden md:rotate-3">
        <div
          className="animate-songket-scroll-right h-12 w-[240dvw] bg-repeat-x will-change-transform md:h-16 lg:h-20"
          style={{
            backgroundImage: "url('/assets/images/patern/songket.jpg')",
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            backgroundPosition: "0 50%",
            animation: "songketScrollRight 25s linear infinite",
          }}
        />
      </div>
    </section>
  )
}
