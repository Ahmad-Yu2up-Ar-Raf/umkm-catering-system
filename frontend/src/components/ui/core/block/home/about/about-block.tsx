import { useRef } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { BlurReveal } from "@/components/motion/blur-reveal"

/**
 * #tentang-kami — the founder/philosophy block.
 *
 * Motion (GSAP ScrollTrigger, `prefers-reduced-motion` → static):
 *  - The right-side hero object is a single top-down Tumpeng PNG that rotates
 *    continuously, tied 1:1 to the user's scroll through the section
 *    (`scrub: true`, rotate 0 → 45°) around its center — a slow, premium spin
 *    that makes the hero object feel alive without any extra UI.
 *  - Header + description reveal via the shared word-blur primitives.
 */
function AboutBlock() {
  const sectionRef = useRef<HTMLElement>(null)
  const tumpengRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced || !sectionRef.current || !tumpengRef.current) return

      // Continuous scroll-linked rotation — the tumpeng turns 45° across the
      // section's full travel, scrubbed to the wheel (no snap, center origin).
      gsap.fromTo(
        tumpengRef.current,
        { rotate: 0 },
        {
          rotate: 45,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
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
      className="container content-center py-20 lg:pb-25 lg:py-0 lg:pt-30"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
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
            terbaik yang itu penting.
          </BlurReveal>
        </header>

        {/* Kanan — the rotating Tumpeng hero object. The wrapper spins around
            its center as the user scrolls through the section. */}
        <div className="flex w-full items-center justify-end lg:w-[50%]">
          <div
            ref={tumpengRef}
            className="relative size-full md:h-[360px] md:w-[360px] lg:h-[400px] lg:w-[400px]"
            style={{ transformOrigin: "center" }}
          >
            <img
              src="/assets/images/about/tumpeng-from-top.png"
              alt="Tumpeng nasi kuning khas Nusantara dilihat dari atas"
              loading="lazy"
              className="h-full w-full md:scale-110 object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutBlock
