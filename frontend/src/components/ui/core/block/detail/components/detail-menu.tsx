"use client"

import { motion, type Variants } from "framer-motion"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckIcon } from "@hugeicons/core-free-icons"

import type { DetailViewModel } from "../utils/detail-view-model"

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/** One subtle whileInView reveal per composite node (heading, each group). */
function block(reduced: boolean): Variants {
  return {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: LUXURY_EASE },
    },
  }
}

/**
 * Menu & Isi Paket — the editorial menu section (full width, below the fold).
 * Always renders Menu Utama; Menu Tambahan only when present. Clean grouped
 * lists with subtle check marks — a premium catering menu, not a table.
 */
export function DetailMenu({ vm }: { vm: DetailViewModel }) {
  const reduced = useReducedMotion()
  const reveal = block(reduced)

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      aria-labelledby="detail-menu-heading"
      className="w-full border-t border-border pt-10 md:pt-12"
    >
      <motion.div variants={reveal} className="flex flex-col gap-3">
        <p className="text-[11px] tracking-[0.34em] text-primary uppercase">
          Menu & Isi Paket
        </p>
        <h2
          id="detail-menu-heading"
          className="font-heading text-[clamp(24px,3vw,34px)] leading-tight font-light tracking-[-0.01em] text-foreground"
        >
          Apa saja yang termasuk?
        </h2>
      </motion.div>

      <div className="mt-8 grid max-w-4xl gap-10 md:grid-cols-2 md:gap-12">
        {vm.menuMain.length > 0 && (
          <motion.div variants={reveal}>
            <h3 className="font-sans text-sm font-semibold tracking-wider text-foreground uppercase">
              Menu Utama
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {vm.menuMain.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 font-heading text-lg font-light text-foreground"
                >
                  <HugeiconsIcon
                    icon={CheckIcon}
                    className="size-4 shrink-0 text-primary"
                  />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {vm.menuExtra && vm.menuExtra.length > 0 && (
          <motion.div variants={reveal}>
            <h3 className="font-sans text-sm font-semibold tracking-wider text-foreground uppercase">
              Lauk / Pelengkap
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {vm.menuExtra.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 font-heading text-lg font-light text-foreground"
                >
                  <HugeiconsIcon
                    icon={CheckIcon}
                    className="size-4 shrink-0 text-primary/70"
                  />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}
