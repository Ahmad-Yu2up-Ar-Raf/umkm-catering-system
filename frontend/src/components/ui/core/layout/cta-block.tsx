"use client"

import { useEffect, useRef } from "react"

import { useLocation } from "react-router"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, ScrollTrigger, useGSAP } from "@/components/motion/gsap"
import { BlurReveal } from "@/components/motion/blur-reveal"
import { WordReveal } from "@/components/motion/word-reveal"
import { ParallaxMotionBackground } from "@/components/motion/parallax-motion-background"
import { usePreloaderStore } from "@/store/preloader-store"
import { OriginButton } from "@/components/ui/fragments/custom-ui/button/cta-button"
import { ArrowRight } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

/**
 * #kontak — final conversion band above the footer (inspired by
 * tiskacatering.com/#kontak, shared grammar with #hero).
 *
 * Motion (GSAP + Framer, all scroll-triggered since the section sits below
 * the fold — a mount-time reveal would be over before the user arrives):
 *  - Background: `ParallaxMotionBackground` — velocity-scrubbed parallax +
 *    a 1.15→1.0 "scale zoom-out" reveal as the section enters.
 *  - Eyebrow: two hairlines expand scaleX 0→1 in perfect sync (one tween,
 *    no stagger) while the label blur-fades in.
 *  - Title: word-by-word blur reveal (`WordReveal`, clearProps'd filter),
 *    triggered once on scroll.
 *  - CTA: scale-up + fade, just after the title reads.
 * All easing reuses the shared luxury cubic-bezier / power3.out family.
 */
function CTABlock() {
  const sectionRef = useRef<HTMLElement>(null)
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const eyebrowLineLRef = useRef<HTMLDivElement>(null)
  const eyebrowLineRRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const location = useLocation()
  const preloaderDone = usePreloaderStore((s) => s.done)

  // The global section stays MOUNTED across route changes and only mounts
  // after the preloader finishes (layout-wrapper). Its ScrollTriggers were
  // measured against whatever page height existed at that moment — stale after
  // navigation or once the curtain lifts and the footer/images settle. Re-pin
  // the geometry shortly after each route change and preloader flip so the
  // reveal/parallax always fire (fixes the disappearing background).
  useEffect(() => {
    if (reduced) return
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 100)
    return () => window.clearTimeout(t)
  }, [preloaderDone, location.pathname, reduced])

  // Eyebrow hairlines — BOTH expand width 0 → 100% in perfect sync (one tween
  // over both refs, no stagger), mirroring outward from the label, as the
  // eyebrow scrolls into view — coinciding with the eyebrow text's blur-fade.
  useGSAP(
    () => {
      if (reduced || !eyebrowRef.current) return
      const L = eyebrowLineLRef.current
      const R = eyebrowLineRRef.current
      if (!L || !R) return
      gsap.set(L, { transformOrigin: "right center" })
      gsap.set(R, { transformOrigin: "left center" })
      gsap.fromTo(
        [L, R],
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: eyebrowRef.current,
            start: "top 85%",
            once: true,
          },
        }
      )
    },
    { scope: sectionRef }
  )

  return (
    <section ref={sectionRef} id="kontak" className="relative size-full">
      <main className="relative m-auto flex min-h-[40lvh] md:min-h-[80lvh] w-full flex-col items-center justify-center overflow-hidden">
        {/* Reusable motion backdrop — parallax + scale zoom-out + scrims.
            NOTE: the image path MUST stay `.png` — a stray `.pmg` 404s the
            photo and the background silently "disappears" (only scrims + text
            render), which is the bug that looked like a ScrollTrigger failure. */}
        <ParallaxMotionBackground
          imageUrl="/assets/images/lifestyle/corporate-lunch-box-overhead-lifestyle.png"
          parallaxSpeed={0.3}
          overlayGradient={[
            "bg-gradient-to-t from-background/80 via-background/30 to-background",
            "bg-[radial-gradient(72%_64%_at_50%_44%,var(--background)_0%,transparent_72%)]",
          ]}
        />

        <div className="relative flex w-full flex-col items-center justify-center gap-1 px-7 py-24 text-center sm:px-6">
          {/* Eyebrow — hairline · label · hairline, word blur-fade + synced lines. */}
          <div
            ref={eyebrowRef}
            className="relative mb-5 flex w-full items-center justify-center gap-4 text-xs tracking-[0.34em] text-primary uppercase sm:max-w-md md:px-6"
          >
            <div
              ref={eyebrowLineLRef}
              aria-hidden="true"
              className="h-[2px] w-full flex-1 rounded-full bg-primary"
            />
            <BlurReveal
              blur={6}
              stagger={0.08}
              amount={0.6}
              className="flex w-fit text-[10px] tracking-[0.2em] lg:text-xs"
            >
              Let's Celebrate Love
            </BlurReveal>
            <div
              ref={eyebrowLineRRef}
              aria-hidden="true"
              className="h-[2px] w-full flex-1 rounded-full bg-primary"
            />
          </div>

          {/* Word-by-word blur reveal, scroll-triggered (once). */}
          <h1 className="mb-10 min-w-0 text-[clamp(50px,7vw,85px)] leading-[1.05] font-light tracking-tighter text-balance text-foreground">
            <span className="block">
              <WordReveal
                text="Send your *love* now"
                blur={12}
                duration={1}
                stagger={0.15}
                trigger="scroll"
                scrollStart="top 80%"
              />
            </span>
          </h1>

          {/* CTA — blur-fade + subtle scale-up (0.95 → 1) when in view. */}
          <BlurReveal
            as="span"
            blur={6}
            stagger={0.12}
            scale={0.95}
            amount={0.6}
            className="inline-block"
          >
            <OriginButton
              intensity={0.8}
              range={120}
              className="group text-xs tracking-widest uppercase"
            >
              Hubungi Kami
              <HugeiconsIcon
                icon={ArrowRight}
                className="z-[9] size-4 fill-none transition-transform duration-700 ease-out group-hover:translate-x-1"
              />
            </OriginButton>
          </BlurReveal>
        </div>
      </main>
    </section>
  )
}

export default CTABlock
