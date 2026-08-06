import { useRef, useState } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { BlurReveal } from "@/components/motion/blur-reveal"
import { OriginButton } from "../../../../fragments/custom-ui/button/cta-button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight } from "@hugeicons/core-free-icons"
import Floating, { FloatingElement } from "./components/paralax-floating"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { WordReveal } from "@/components/motion/word-reveal"
import { ParallaxMotionBackground } from "@/components/motion/parallax-motion-background"
import { useIsMobile } from "@/hooks/use-mobile"
/* Hallmark · pre-emit critique: P4 H4 E4 S4 R4 V4 */

/**
 * S1 — Hero "Cita Rasa Rumah" (HOMEPAGE_BUILD §3 S1).
 *
 * Animation architecture (single source of truth = preloaderDone):
 *  - ZERO hero motion runs while the preloader is active.
 *  - The instant `preloaderDone` flips, the H1 LEADS with a word-by-word blur
 *    reveal (`<WordReveal blur>`, clearProps'd after each word) while the
 *    background zoom (ParallaxMotionBackground, `revealTrigger="mount"`,
 *    `play={preloaderDone}`) overlaps it as a fluid backdrop. Eyebrow + its
 *    two synced hairlines → subtitle → CTA follow at tight Framer/GSAP delays;
 *    the floating cards land LAST on the master timeline.
 *  - The Marquee is strictly hidden until `preloaderDone` (no flash under the
 *    scroll-lock clip) and fades in right after the typography.
 */
export function HeroBlock({ preloaderDone }: { preloaderDone: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const eyebrowLineLRef = useRef<HTMLDivElement>(null)
  const eyebrowLineRRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [heroTl, setHeroTl] = useState<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      if (!preloaderDone || reduced || !sectionRef.current) return

      // Scheduler timeline for <Floating> (its cards land after the
      // typography); the background reveal + parallax live inside
      // <ParallaxMotionBackground>, so this timeline only carries timing.
      const tl = gsap.timeline({ delay: 0.15 })

      // Hand the timeline to <Floating>, which injects its staggered card
      // reveal at position 1 via its own useGSAP.
      setHeroTl(tl)

      // Eyebrow hairlines — BOTH expand width 0 → 100% in PERFECT sync
      //    (one tween over both refs, no stagger), mirroring outward from the
      //    label on the same beat as the eyebrow label's Framer blur (0.35s).
      if (eyebrowLineLRef.current && eyebrowLineRRef.current) {
        gsap.set(eyebrowLineLRef.current, { transformOrigin: "right center" })
        gsap.set(eyebrowLineRRef.current, { transformOrigin: "left center" })
        gsap.fromTo(
          [eyebrowLineLRef.current, eyebrowLineRRef.current],
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: "power2.out", delay: 0.35 }
        )
      }
    },
    { scope: sectionRef, dependencies: [preloaderDone] }
  )
  const isMobile = useIsMobile()
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
        {/* Reusable motion backdrop — preloader-gated zoom-out reveal +
            smooth scroll parallax + warm cream scrims (same grammar as
            #kontak, so the two full-bleed sections feel like one system). */}
        <ParallaxMotionBackground
          imageUrl="/assets/images/banners/hero-banner-tumpeng.png"
          parallaxSpeed={0.2}
          revealScale
          revealTrigger="mount"
          play={preloaderDone}
          overlayGradient={[
            "bg-gradient-to-b from-background/80 via-background/30 to-background",
            "bg-[radial-gradient(72%_64%_at_50%_44%,var(--background)_0%,transparent_72%)]",
          ]}
        />

        <div className="relative flex w-full flex-col items-center justify-center gap-1 px-7 py-24 text-center sm:px-6">
          {preloaderDone && (
            <>
              {/* Eyebrow — hairline — label — hairline, word-by-word blur. The
                  two hairlines scaleX 0 → 1 in perfect sync via GSAP (see the
                  master timeline above), mirroring outward from the label. */}
              <div className="relative mb-7 flex w-full max-w-xs items-center gap-4 text-xs tracking-[0.34em] text-primary uppercase sm:max-w-md md:px-6">
                <div
                  ref={eyebrowLineLRef}
                  aria-hidden="true"
                  className="h-[2px] w-full flex-1 rounded-full bg-primary"
                />
                {isMobile ? (
                  <div className="flex flex-col justify-center">
                    <BlurReveal
                      onMount
                      blur={6}
                      stagger={0.12}
                      delay={0.35}
                      className="flex flex-row text-[10px] sm:w-fit sm:gap-2 sm:text-xs"
                    >
                      Catering Service
                    </BlurReveal>
                    <BlurReveal
                      onMount
                      blur={6}
                      stagger={0.12}
                      delay={0.35}
                      className="flex flex-row justify-center text-center text-[10px] sm:w-fit sm:gap-2 sm:text-xs"
                    >
                      Sejak 2024
                    </BlurReveal>
                  </div>
                ) : (
                  <BlurReveal
                    onMount
                    blur={6}
                    stagger={0.08}
                    delay={0.35}
                    className="flex flex-col gap-0 text-[10px] tracking-[0.2em] sm:w-fit sm:flex-row sm:text-xs"
                  >
                    Catering Service · Sejak 2024
                  </BlurReveal>
                )}
                <div
                  ref={eyebrowLineRRef}
                  aria-hidden="true"
                  className="h-[2px] w-full flex-1 rounded-full bg-primary"
                />
              </div>

              <h1 className="min-w-0 text-[clamp(50px,7vw,120px)] leading-[1.05] font-light tracking-tighter text-balance text-foreground">
                <span className="block">
                  <WordReveal
                    text="Celebrate *love* with the"
                    blur={12}
                    duration={1}
                    stagger={0.2}
                    delay={0.35}
                    play={preloaderDone}
                  />
                </span>
                <span className="block">
                  <WordReveal
                    text="*finest* *flavours*"
                    blur={12}
                    duration={1}
                    stagger={0.2}
                    play={preloaderDone}
                    delay={0.35 * 3}
                  />
                </span>
              </h1>

              <BlurReveal
                as="p"
                onMount
                blur={6}
                stagger={0.04}
                delay={0.35 * 3}
                className="mt-[38px] mb-10 max-w-[590px] text-[clamp(14px,1.6vw,18.3px)] leading-[1.7] text-foreground/80"
              >
                Tiga generasi menghadirkan rasa istimewa untuk perayaan Anda —
                semua diantar hangat ke acara Anda di Bogor dan sekitarnya.
              </BlurReveal>

              <BlurReveal
                as="span"
                onMount
                blur={6}
                stagger={0.12}
                delay={0.35 * 6}
                className="inline-block"
              >
                <OriginButton
                  intensity={0.8}
                  range={120}
                  className="group text-xs tracking-widest uppercase"
                >
                  Jelajahi Menu
                  <HugeiconsIcon
                    icon={ArrowRight}
                    className="z-[9] size-4 fill-none transition-transform duration-700 ease-out group-hover:translate-x-1"
                  />
                </OriginButton>
              </BlurReveal>
            </>
          )}
        </div>
      </main>
      <Marque preloaderDone={preloaderDone} />
    </section>
  )
}

export function Marque({ preloaderDone }: { preloaderDone: boolean }) {
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

  // Marquee entrance, gated on the preloader — fixes the rogue flash under
  // the scroll-lock clip. While the preloader is active the whole band is
  // autoAlpha 0 (strictly hidden); the instant `preloaderDone` flips it fades
  // + rises, sync'd to the hero timeline (right after the main typography).
  useGSAP(
    () => {
      if (reduced || !sectionRef.current) return
      if (!preloaderDone) {
        gsap.set(sectionRef.current, { autoAlpha: 0 })
        return
      }
      gsap.fromTo(
        sectionRef.current,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: 0.9,
          clearProps: "transform",
        }
      )
    },
    { scope: sectionRef, dependencies: [preloaderDone] }
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
