import { useRef, useState } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { OriginButton } from "../../../../fragments/custom-ui/button/cta-button"
import { WordReveal } from "@/components/motion/word-reveal"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight } from "@hugeicons/core-free-icons"
import Floating, { FloatingElement } from "./components/paralax-floating"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
/* Hallmark · pre-emit critique: P4 H4 E4 S4 R4 V4 */

/**
 * S1 — Hero "Cita Rasa Rumah" (HOMEPAGE_BUILD §3 S1).
 *
 * Animation architecture (single source of truth = preloaderDone):
 *  - ZERO hero motion runs while the preloader is active — the master timeline
 *    below is gated on `preloaderDone`; text/CTA are pre-hidden at mount and
 *    the title WordReveals are held hidden via `play={preloaderDone}`.
 *  - The master timeline instance is passed down to <Floating> so the child
 *    injects its own staggered reveal (position 1.9, after the Step-C gap) —
 *    no string selectors across the component boundary.
 *  - Background parallax scrub is created after the zoom settles.
 */
export function HeroBlock({ preloaderDone }: { preloaderDone: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const parallaxRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const paraRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()
  const [heroTl, setHeroTl] = useState<gsap.core.Timeline | null>(null)

  // Initial invisible state — set at mount so NOTHING content shows between the
  // preloader exiting and the master timeline commanding each reveal.
  useGSAP(
    () => {
      if (reduced || !sectionRef.current) return
      gsap.set(
        [labelRef.current, paraRef.current, ctaRef.current].filter(
          (el): el is NonNullable<typeof el> => el !== null
        ),
        { autoAlpha: 0 }
      )
      gsap.set(bgRef.current, { scale: 1.16, opacity: 0 })
    },
    { scope: sectionRef }
  )

  useGSAP(
    () => {
      if (!preloaderDone || reduced || !sectionRef.current) return

      const tl = gsap.timeline()

      // 1. Background "zoom-out" entrance — scale up, settle, fade in.
      tl.fromTo(
        bgRef.current,
        { scale: 1.16, opacity: 0 },
        { scale: 1.1, opacity: 1, duration: 1.6, ease: "power2.out" },
        0
      )
        // 2. Label — smooth slide-up (same easing family as the word reveal).
        .fromTo(
          labelRef.current,
          { y: 26, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" },
          0.1
        )
        // 3. Paragraph — deliberate gap (+=0.4) after the title settles.
        .fromTo(
          paraRef.current,
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" },
          0.3
        )
        // 4. CTA — distinct gap (+=0.4) after the paragraph, appears last.
        .fromTo(
          ctaRef.current,
          { y: 22, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: "power3.out",
            clearProps: "transform",
          },
          0.5
        )

      // Hand the timeline to <Floating>, which injects its staggered card
      // reveal at position 1.9 (Step-C gap) via its own useGSAP.
      setHeroTl(tl)

      // 5. Background parallax — subtle, tight scrub on the WRAPPER only.
      //    The FROM state equals the resting position (yPercent 0) so the
      //    ScrollTrigger initializes at scrollY 0 with zero visible jump.
      gsap.fromTo(
        parallaxRef.current,
        { yPercent: 0 },
        {
          yPercent: 4,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      )
    },
    { scope: sectionRef, dependencies: [preloaderDone] }
  )

  return (
    <section ref={sectionRef} id="beranda" className="size-full">
      <main className="relative m-auto mb-0.5 flex min-h-lvh w-full flex-col items-center justify-center overflow-hidden">
        <Floating sensitivity={-0.5} timeline={heroTl} className="h-full">
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

                webViewLink={"/assets/images/products/ai-generated/wedding.png"}
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

                webViewLink={
                  "/assets/images/products/ai-generated/kantor-3.png"
                }
              />
            </div>
          </FloatingElement>
        </Floating>
        {/* Parallax wrapper (scroll scrub + scale-110 headroom) owns yPercent;
            the child owns the one-shot load zoom — no shared transform. */}
        <div ref={parallaxRef} className="absolute inset-0 -z-10 scale-110">
          <div ref={bgRef} className="h-full w-full">
            <img
              src="/assets/images/banners/hero-banner-tumpeng.png"
              alt="Tumpeng Catering Nusantara untuk perayaan syukuran"
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </div>
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
            ref={labelRef}
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
                play={preloaderDone}
                delay={0.15}
              />
            </span>
            <span className="block">
              <WordReveal
                text="*finest* *flavours*"
                play={preloaderDone}
                delay={0.3}
              />
            </span>
          </h1>

          <p
            ref={paraRef}
            className="mt-[38px] mb-10 max-w-[590px] text-[clamp(14px,1.6vw,18.3px)] leading-[1.7] text-foreground/80"
          >
            Tiga generasi menghadirkan rasa istimewa untuk perayaan Anda — di
            Bogor, Jakarta, dan sekitarnya.
          </p>

          <OriginButton
            intensity={0.8} // opsional, defaultnya 0.6
            range={120} // opsional, defaultnya 100
            ref={ctaRef}
            className="group text-xs tracking-widest uppercase"
          >
            Jelajahi Menu
            <HugeiconsIcon
              icon={ArrowRight}
              className="stroke-primtext-primary z-[9] size-4 fill-none transition-all duration-[800ms] ease-out group-hover:left-4 group-hover:translate-x-1 group-hover:stroke-white"
            />
          </OriginButton>
        </div>
      </main>
      <Marque />
    </section>
  )
}

export function Marque() {
  const sectionRef = useRef<HTMLElement>(null)
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced || !sectionRef.current) return

      const scrub = 0.5 // tight, responsive to the wheel
      const trigger = {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub,
      }

      // Row 1 — drifts LEFT, subtle travel as the user scrolls down.
      gsap.fromTo(
        row1Ref.current,
        { xPercent: -10 },
        { xPercent: -20, ease: "none", scrollTrigger: trigger }
      )
      // Row 2 — drifts RIGHT, opposite direction.
      gsap.fromTo(
        row2Ref.current,
        { xPercent: -20 },
        { xPercent: -10, ease: "none", scrollTrigger: trigger }
      )
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative mb-20 w-full content-center md:mb-26"
    >
      <div className="absolute top-0 -right-1 w-[120dvw] -rotate-7 overflow-hidden md:-rotate-3">
        <div
          ref={row1Ref}
          className="h-12 w-[240dvw] bg-repeat-x md:h-16 lg:h-20"
          style={{
            backgroundImage: "url('/assets/images/patern/songket2.jpg')",
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            backgroundPosition: "0 50%",
          }}
        />
      </div>

      <div className="absolute top-0 -right-1 w-[120dvw] rotate-7 overflow-hidden md:rotate-3">
        <div
          ref={row2Ref}
          className="h-12 w-[240dvw] bg-repeat-x md:h-16 lg:h-20"
          style={{
            backgroundImage: "url('/assets/images/patern/songket.jpg')",
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            backgroundPosition: "0 50%",
          }}
        />
      </div>
    </section>
  )
}
