"use client"

import { useRef } from "react"
import { motion } from "framer-motion"

import { useReducedMotion } from "@/hooks/use-reduced-motion"

import type { DetailViewModel } from "../utils/detail-view-model"
import { DetailGallery } from "./detail-gallery"
import { DetailSummary } from "./detail-summary"
import { DetailMenu } from "./detail-menu"
import { DetailFacilities } from "./detail-facilities"

/** Premium ease — Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/**
 * DetailContent — the real page.
 *
 * Motion (grouped, one signature moment per surface):
 *  - Gallery column: ONE coordinated reveal (opacity / y / blur).
 *  - Summary rail: three decision groups + description, staggered inside
 *    DetailSummary (each group a single node — never per-element).
 *  - Lower sections: subtle whileInView (opacity/y), no blur below the fold.
 * Reduced motion → opacity only (block root MotionConfig).
 */
export function DetailContent({ vm }: { vm: DetailViewModel }) {
  const reduced = useReducedMotion()
  const galleryRef = useRef<HTMLDivElement>(null)

  const galleryHidden = reduced ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(10px)" }
  const galleryShown = reduced
    ? { opacity: 1, transition: { duration: 0.4 } }
    : {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.7, ease: LUXURY_EASE },
      }

  return (
    <div className="container m-auto w-full px-5 pt-8 pb-24   md:pt-20  ">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-20">
        <motion.div
          ref={galleryRef}
          initial={galleryHidden}
          animate={galleryShown}
          onAnimationComplete={() => {
            galleryRef.current?.style.removeProperty("filter")
          }}
        >
          <DetailGallery
            gallery={vm.gallery}
            alt={vm.name}
            modalTitle={vm.name}
            modalCategory={vm.categoryLabel}
          />
        </motion.div>

        <DetailSummary vm={vm} />
      </div>

      {/* <div className="mt-16 flex flex-col gap-16 md:mt-24 md:gap-20">
        <DetailMenu vm={vm} />
        <DetailFacilities vm={vm} />
      </div> */}
    </div>
  )
}
