"use client"

import { motion } from "framer-motion"

import { useReducedMotion } from "@/hooks/use-reduced-motion"

import type { DetailViewModel } from "../utils/detail-view-model"

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/**
 * Fasilitas & Ketentuan — included facilities + allergen note, inside the
 * right rail. Kemasan / Kapasitas rows live in the summary meta (no
 * duplication). Bullet lists stay scannable without icon clutter.
 */
export function DetailFacilities({ vm }: { vm: DetailViewModel }) {
  const reduced = useReducedMotion()
  const hasFacilities = Boolean(vm.facilities?.length)

  if (!hasFacilities && !vm.allergenNote) return null

  return (
    <motion.section
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: LUXURY_EASE }}
      aria-labelledby="detail-facilities-heading"
      className="flex w-full flex-col gap-5"
    >
      <h2
        id="detail-facilities-heading"
        className="font-sans text-xs font-semibold tracking-[0.2em] text-foreground uppercase"
      >
        Fasilitas & Ketentuan
      </h2>

      {hasFacilities && (
        <ul className="list-disc space-y-2.5 pl-5 marker:text-primary">
          {vm.facilities!.map((item) => (
            <li
              key={item}
              className="text-[15px] leading-relaxed text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      )}

      {vm.allergenNote && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">
            Catatan bahan & alergen —{" "}
          </span>
          {vm.allergenNote}
        </p>
      )}
    </motion.section>
  )
}
