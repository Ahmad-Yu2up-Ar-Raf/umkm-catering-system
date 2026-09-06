"use client"

import { motion } from "framer-motion"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Spoon } from "@hugeicons/core-free-icons"

import type { DetailViewModel } from "../utils/detail-view-model"

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/**
 * Fasilitas & Ketentuan — icon on the section header, clean bullet list
 * below. The Bahan & Alergen note lives at the very bottom of the summary
 * rail (separate block), and Acara/Kemasan/Kapasitas are single-source in the
 * summary meta — no duplicate facts between surfaces.
 */
export function DetailFacilities({ vm }: { vm: DetailViewModel }) {
  const reduced = useReducedMotion()
  const hasFacilities = Boolean(vm.facilities?.length)

  if (!hasFacilities) return null

  return (
    <motion.section
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: LUXURY_EASE }}
      aria-labelledby="detail-facilities-heading"
      className="flex gap-5"
    >
      <HugeiconsIcon
        icon={Spoon}
        className="hidden size-5 text-primary/80 sm:block"
      />
      <div className="flex w-full flex-col gap-4">
        <h2
          id="detail-facilities-heading"
          className="flex items-center gap-2.5 font-sans text-sm font-semibold tracking-[0.2em] text-foreground uppercase"
        >
          Fasilitas & Ketentuan
        </h2>

        <ul className="list-disc space-y-2 pl-5 marker:text-primary">
          {vm.facilities!.map((item) => (
            <li
              key={item}
              className="text-[15px] leading-relaxed text-foreground md:text-base"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  )
}
