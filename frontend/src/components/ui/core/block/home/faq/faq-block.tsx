"use client"

import React, { useRef } from "react"

import { MotionConfig } from "framer-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

import { FAQ_CATEGORIES, FAQ_ITEMS } from "./faq-data"
import { CategoryCarousel } from "./components/category-carousel"
import { CategoryTabs } from "./components/category-tabs"
import { FaqAccordion } from "./components/faq-accordion"
import { FaqCta } from "./components/faq-cta"
import { BlurReveal } from "@/components/motion/blur-reveal"

/** Luxury ease — premium Apple-like cubic-bezier. GSAP accepts bezier arrays
 *  at runtime; its typings only enumerate named easings, so cast the tuple. */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as unknown as gsap.EaseString

/**
 * FAQ section — editorial block for Catering Nusantara.
 *
 * Motion grammar (GSAP primary):
 *  - One scroll-triggered entrance for the whole section (header → categories
 *    → accordion items → final separator), run once.
 *  - Switching categories re-staggers the accordion items + bottom separator
 *    sequentially instead of fading the whole list.
 *  - Category & accordion active indicators glide via Framer `layoutId`.
 *  - Mobile: category tabs become a horizontal carousel; the WhatsApp CTA is
 *    reordered below the accordion (`order-last`).
 */
export function FaqsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const firstRevealDone = useRef(false)
  const [activeCategory, setActiveCategory] = React.useState(
    FAQ_CATEGORIES[0].id
  )
  const [openItem, setOpenItem] = React.useState<string | undefined>(undefined)
  const reduced = useReducedMotion()

  const filtered = FAQ_ITEMS.filter((faq) => faq.category === activeCategory)

  const selectCategory = (id: string) => {
    setActiveCategory(id)
    setOpenItem(undefined)
  }

  // Scroll-triggered entrance — Hero-consistent easing, once, no reverse jitter.
  // Hardware-accelerated props only (transform/opacity).
  useGSAP(
    () => {
      if (!sectionRef.current) return

      if (reduced) {
        // Reduced motion → end state only: undo the base `opacity-0` classes
        // so sections/buttons are visible without any tween.
        gsap.set(
          gsap.utils.selector(sectionRef.current)(
            "[data-faq-cat], [data-faq-item], [data-faq-final-sep], [data-faq-sep]"
          ),
          { autoAlpha: 1, scaleX: 1 }
        )
        return
      }

      const q = gsap.utils.selector(sectionRef.current)
      const cats = q("[data-faq-cat]")
      const items = q("[data-faq-item]")
      const sep = q("[data-faq-final-sep]")
      const seps = q("[data-faq-sep]")

      // Pre-hide so nothing flashes as the section scrolls in.
      gsap.set([...cats, ...items, ...sep], { autoAlpha: 0 })
      gsap.set(seps, { scaleX: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          // The section is `min-h-lvh content-center` — its content is
          // VERTICALLY CENTERED. A section-level `top 80%` fires while only
          // the header grazes the bottom of the screen and the categories /
          // accordion are still below the fold (the premature feel). Firing at
          // `top 50%` puts the header mid-screen with the content entering —
          // the cascade is actually SEEN.
          start: "top 50%",
          once: true,
        },
        onComplete: () => {
          firstRevealDone.current = true
        },
      })

      tl.fromTo(
        cats,
        { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            // Longer + wider cascade so the scroll reveal reads as a fluid
            // sweep (0.85s, generous 0.18s stagger) instead of an instant pop.
            duration: 0.85,
            ease: LUXURY_EASE,
            stagger: 0.18,
          },
          0
        )
        // TOP separator — grows from the left, in PARALLEL with the first
        // accordion items (it sits above them), NEVER as the final element.
        // (Previously it animated last — the jarring "separator appears after
        // everything" anomaly.)
        .fromTo(
          seps,
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: "left center",
            duration: 0.8,
            ease: "power2.out",
          },
          0.45
        )
        .fromTo(
          items,
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: LUXURY_EASE,
            stagger: 0.14,
          },
          "-=0.15"
        )
        // BOTTOM separator — closes the list, last by design.
        .fromTo(
          sep,
          { y: 24, autoAlpha: 0, scaleX: 0 },
          {
            y: 0,
            autoAlpha: 1,
            scaleX: 1,
            transformOrigin: "left center",
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.15"
        )
    },
    { scope: sectionRef }
  )

  // Category switch — sequential reveal for EVERY accordion item, ending on
  // the bottom separator. The list remounts (keyed), so we target the fresh
  // nodes and stagger them in exactly like the first page load.
  useGSAP(
    () => {
      if (reduced || !sectionRef.current || !firstRevealDone.current) return

      const q = gsap.utils.selector(sectionRef.current)
      const items = q("[data-faq-item]")
      const sep = q("[data-faq-final-sep]")
      if (!items.length) return

      // Items stagger in one-by-one, luxury ease; the bottom separator follows
      // with a center-left scaleX reveal so it re-renders with the list.
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: LUXURY_EASE,
          stagger: 0.07,
        }
      )
      gsap.fromTo(
        sep,
        { autoAlpha: 0, scaleX: 0 },
        {
          autoAlpha: 1,
          scaleX: 1,
          transformOrigin: "left center",
          duration: 0.6,
          ease: LUXURY_EASE,
        }
      )
    },
    { dependencies: [activeCategory], scope: sectionRef }
  )

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        id="faq"
        className="container min-h-lvh content-center space-y-10 px-0 py-30 md:space-y-10"
      >
        <header className="flex w-full flex-1 flex-col items-end gap-y-6 px-5 sm:flex-row sm:justify-between md:gap-y-9 md:px-0">
          <div className="flex w-full flex-col gap-y-1">
            <div>
              <p className="text-gold-deep mb-6 flex items-center gap-3.5 text-[11px] font-normal tracking-[0.28em] uppercase">
                <div aria-hidden="true" className="h-px w-10 bg-primary" />
                <BlurReveal as="span" className="text-primary" amount={0.3}>
                  Pertanyaan Umum
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
                Hal yang sering
              </BlurReveal>
              <BlurReveal
                as="span"
                className="block font-accent text-primary italic"
                stagger={0.08}
                amount={0.3}
              >
                ditanyakan.
              </BlurReveal>
            </h2>
          </div>

          <BlurReveal
            as="p"
            className="text-xs leading-relaxed text-muted-foreground sm:w-1/2 md:text-sm"
            amount={0.3}
          >
            Semua yang perlu Anda tahu sebelum merayakan momen bersama kami —
            dari layanan dan menu hingga ketentuan biaya.
          </BlurReveal>
        </header>

        <div className="relative grid min-h-full grid-cols-1 py-0 md:grid-cols-4 md:py-12">
          {/* Desktop: category sub-nav + CTA (left, sticky). */}
          <div className="hidden h-fit flex-col items-start gap-8 border-b pb-2 md:sticky md:top-20 md:flex md:border-b-0">
            <CategoryTabs
              categories={FAQ_CATEGORIES}
              activeCategory={activeCategory}
              onSelect={selectCategory}
            />
            <FaqCta className="hidden md:flex" />
          </div>

          {/* Mobile: carousel → accordion → CTA reordered to the very bottom. */}
          <div className="col-span-1 flex h-fit flex-col pl-0 md:col-span-3 md:pl-23">
            <CategoryCarousel
              categories={FAQ_CATEGORIES}
              activeCategory={activeCategory}
              onSelect={selectCategory}
              className="mb-8 md:hidden"
            />
            <FaqAccordion
              key={activeCategory}
              items={filtered}
              openItem={openItem}
              onOpenChange={setOpenItem}
            />
            <FaqCta className="order-last mt-12 px-5 md:hidden md:px-0" />
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}
