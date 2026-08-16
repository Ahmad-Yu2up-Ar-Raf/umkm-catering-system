"use client"

import { motion } from "framer-motion"

import { useReducedMotion } from "@/hooks/use-reduced-motion"

import type { DetailViewModel } from "../utils/detail-view-model"

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/**
 * Menu & Isi Paket — scannable bullet lists inside the right rail.
 * Menu Utama always; Lauk/Pelengkap only when present. Distinct dot markers
 * make the dishes instantly readable without per-item icon clutter.
 */
export function DetailMenu({ vm }: { vm: DetailViewModel }) {
  const reduced = useReducedMotion()

  return (
    <motion.section
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: LUXURY_EASE }}
      aria-labelledby="detail-menu-heading"
      className="flex w-full flex-col gap-5"
    >
      <h2
        id="detail-menu-heading"
        className="font-sans text-xs font-semibold tracking-[0.2em] text-foreground uppercase"
      >
        Menu & Isi Paket
      </h2>

      <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
        {vm.menuMain.length > 0 && (
          <div>
            <h3 className="text-[11px] tracking-wider text-muted-foreground uppercase">
              Menu Utama
            </h3>
            <ul className="mt-3 list-disc space-y-2.5 pl-5 marker:text-primary">
              {vm.menuMain.map((item) => (
                <li
                  key={item}
                  className="text-[15px] leading-relaxed text-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {vm.menuExtra && vm.menuExtra.length > 0 && (
          <div>
            <h3 className="text-[11px] tracking-wider text-muted-foreground uppercase">
              Lauk / Pelengkap
            </h3>
            <ul className="mt-3 list-disc space-y-2.5 pl-5 marker:text-primary">
              {vm.menuExtra.map((item) => (
                <li
                  key={item}
                  className="text-[15px] leading-relaxed text-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.section>
  )
}
