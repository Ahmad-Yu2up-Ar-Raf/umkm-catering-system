"use client"

import { motion } from "framer-motion"

import { BlurReveal } from "@/components/motion/blur-reveal"

/**
 * MomentHeader — eyebrow + display headline (single italic accent word) +
 * the "Lihat galeri lengkap" CTA.
 *
 * Reveal — the project-standard blur fade (matching #mengapa / #tentang-kami
 * / #faq / #menu):
 *  - Eyebrow label and the H2 blur-fade FIRST (shared `BlurReveal`).
 *  - The CTA follows with a short delay (a `motion.a`, transform/opacity only).
 * Reduced motion → instant (parent `MotionConfig reducedMotion="user"`).
 */
export function MomentHeader() {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div className="min-w-0">
        <p className="mb-6 flex items-center gap-3.5 text-[11px] tracking-[0.34em] uppercase">
          <span aria-hidden="true" className="h-px w-10 bg-primary" />
          <BlurReveal as="span" className="text-primary" amount={0.3}>
            Portofolio
          </BlurReveal>
        </p>
        <h2 className="font-heading text-[clamp(30px,3.8vw,54px)] leading-[0.95] font-light tracking-[-0.01em] text-foreground">
          <BlurReveal blur={10} stagger={0.07} amount={0.3}

          
          >
            Momen yang kami{" "}
            <span className="font-accent italic text-primary">rayakan</span>
          </BlurReveal>
        </h2>
      </div>

      <motion.a
        href="#momentum"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="group inline-flex items-center gap-2 pb-1 text-[11px] tracking-[0.2em] text-primary uppercase transition-colors duration-300 hover:text-foreground"
      >
        Lihat galeri lengkap
        <span
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </motion.a>
    </div>
  )
}
