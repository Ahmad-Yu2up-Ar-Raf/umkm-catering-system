"use client"

import { useRef } from "react"
import { motion } from "framer-motion"

import { useReducedMotion } from "@/hooks/use-reduced-motion"

import type { DetailViewModel } from "../utils/detail-view-model"
import { DetailGallery } from "./detail-gallery"
import { DetailSummary } from "./detail-summary"
import { DetailRecommendations } from "./detail-recommendations"

/** Premium ease — Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/**
 * DetailContent — strict two-column layout on desktop.
 *
 * LEFT: sticky image gallery (CSS-native, no JS offset).
 * RIGHT: every piece of textual information — summary, price/CTA, meta,
 * description, menu and facilities (all inside DetailSummary).
 * BOTTOM: "Rekomendasi Paket" — related packages carousel, full width.
 *
 * Motion (grouped, one signature moment per surface): the gallery column gets
 * ONE coordinated reveal; the summary animates its decision groups; lower
 * content reveals on scroll. Reduced motion → opacity only.
 */
export function DetailContent({ vm }: { vm: DetailViewModel }) {
  const reduced = useReducedMotion()
  const galleryRef = useRef<HTMLDivElement>(null)

  const galleryHidden = reduced
    ? { opacity: 0 }
    : { opacity: 0, y: 24, filter: "blur(10px)" }
  const galleryShown = reduced
    ? { opacity: 1, transition: { duration: 0.4 } }
    : {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.7, ease: LUXURY_EASE },
      }

  return (
    <div className="container m-auto w-full px-5 pt-8 pb-24 lg:px-9  md:pt-19 md:pb-32">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
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

      <DetailRecommendations currentId={vm.id} className="mt-16 md:mt-20" />
    </div>
  )
}
