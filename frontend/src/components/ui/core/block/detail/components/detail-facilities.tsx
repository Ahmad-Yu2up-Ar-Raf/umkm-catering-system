"use client"

import { motion, type Variants } from "framer-motion"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckIcon, SparklesIcon } from "@hugeicons/core-free-icons"

import type { DetailViewModel } from "../utils/detail-view-model"

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

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
 * Fasilitas & Ketentuan — included facilities + allergen note. The Kemasan
 * and Kapasitas rows live in the summary meta (single source — no duplicate
 * customer-facing facts between the two surfaces).
 */
export function DetailFacilities({ vm }: { vm: DetailViewModel }) {
  const reduced = useReducedMotion()
  const reveal = block(reduced)
  const hasFacilities = Boolean(vm.facilities?.length)

  if (!hasFacilities && !vm.allergenNote) return null

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      aria-labelledby="detail-facilities-heading"
      className="w-full border-t border-border pt-10 md:pt-12"
    >
      <motion.div variants={reveal} className="flex flex-col gap-3">
        <p className="text-[11px] tracking-[0.34em] text-primary uppercase">
          Ketentuan
        </p>
        <h2
          id="detail-facilities-heading"
          className="font-heading text-[clamp(24px,3vw,34px)] leading-tight font-light tracking-[-0.01em] text-foreground"
        >
          Fasilitas yang <span className="font-accent text-primary italic">termasuk</span>
        </h2>
      </motion.div>

      <motion.div
        variants={reveal}
        className="mt-8 flex max-w-4xl flex-col gap-8"
      >
        {hasFacilities && (
          <ul className="flex flex-col gap-3">
            {vm.facilities!.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-[15px] leading-relaxed text-foreground"
              >
                <HugeiconsIcon
                  icon={CheckIcon}
                  className="size-4 shrink-0 text-primary"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {vm.allergenNote && (
          <p className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
            <HugeiconsIcon
              icon={SparklesIcon}
              className="mt-0.5 size-4 shrink-0 text-primary/70"
            />
            <span>
              <span className="font-medium text-foreground">
                Catatan bahan & alergen —{" "}
              </span>
              {vm.allergenNote}
            </span>
          </p>
        )}
      </motion.div>
    </motion.section>
  )
}
