"use client"

import { motion } from "framer-motion"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cake, ChefHatIcon, Dish01Icon } from "@hugeicons/core-free-icons"

import type { DetailViewModel } from "../utils/detail-view-model"

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/**
 * Menu & Isi Paket — icon on the sub-section headers only; the dishes
 * themselves render as clean bullet lists (`marker:text-primary`) so the row
 * level stays quiet and scannable.
 */
export function DetailMenu({ vm }: { vm: DetailViewModel }) {
  const reduced = useReducedMotion()

  return (
    <motion.section
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: LUXURY_EASE }}
      aria-labelledby="detail-menu-heading"
      className="flex gap-5"
    >
      <HugeiconsIcon
        icon={Dish01Icon}
        className="size-[18px] lg:size-5 text-primary/80"
      />
      <div className="flex w-full flex-col gap-5 md:gap-6">
        <h2
          id="detail-menu-heading"
          className="flex items-center gap-4 font-sans text-sm font-semibold tracking-[0.2em] text-foreground uppercase"
        >
          Menu & Isi Paket
        </h2>

        <div className="grid gap-8 grid-cols-2 md:gap-12">
          {vm.menuMain.length > 0 && (
            <div className="flex gap-5">
              {/* <HugeiconsIcon
                icon={Dish01Icon}
                className="size-[18px] text-primary/80"
              /> */}
              <div className="">
                <h3 className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase md:text-[13px]">
                  Menu Utama
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-primary md:mt-3.5">
                  {vm.menuMain.map((item) => (
                    <li
                      key={item}
                      className="text-[15px] leading-relaxed text-foreground md:text-base"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {vm.menuExtra && vm.menuExtra.length > 0 && (
            <div className="flex gap-5">
              {/* <HugeiconsIcon
                icon={Cake}
                className="size-[18px] text-primary/80"
              /> */}
              <div className="">
                <h3 className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase md:text-[13px]">
                  Lauk / Pelengkap
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-primary md:mt-3.5">
                  {vm.menuExtra.map((item) => (
                    <li
                      key={item}
                      className="text-[15px] leading-relaxed text-foreground md:text-base"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  )
}
