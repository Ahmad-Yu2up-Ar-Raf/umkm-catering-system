"use client"

import { useState } from "react"
import { format } from "date-fns"
import { motion } from "framer-motion"

import { HugeiconsIcon } from "@hugeicons/react"
import { Message01Icon, MessageAdd01Icon, StarIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/fragments/shadcn-ui/carousel"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

import type { DetailViewModel } from "../utils/detail-view-model"
import { usePaketReviews, type PaketReview } from "../hooks/use-paket-reviews"
import { AddReviewDialog } from "./add-review-dialog"

/** Premium ease — matches the detail page motion grammar. */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/** Compact 5-star readout. Shared with the add-review dialog. */
export function ReviewStars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`Rating ${value} dari 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <HugeiconsIcon
          key={i}
          icon={StarIcon}
          className={cn(
            "size-3.5",
            i < value ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/40"
          )}
        />
      ))}
    </span>
  )
}

function ReviewCard({ review }: { review: PaketReview }) {
  return (
    <article className="flex h-full min-w-0 flex-col gap-3 rounded-2xl border border-border bg-transparent p-5 sm:p-6">
      <ReviewStars value={review.rating} />
      <p className="line-clamp-4 text-sm leading-relaxed text-foreground/90">
        {review.pesanan}
      </p>
      <footer className="mt-auto flex items-center gap-2.5 pt-1">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
          <HugeiconsIcon icon={Message01Icon} className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">
            {review.nama}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {[review.acara, review.lokasi].filter(Boolean).join(" · ")}
            {review.tanggal_acara
              ? ` · ${format(new Date(review.tanggal_acara), "dd MMM yyyy")}`
              : ""}
          </span>
        </span>
      </footer>
    </article>
  )
}

/** Mirrors the live carousel track (basis 80/55/32) — a horizontal peek row
 *  on mobile, never a vertical stack. Exported for DetailSkeleton reuse. */
export function CarouselSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex shrink-0 basis-[80%] flex-col gap-3 rounded-2xl border border-border p-5 sm:basis-[55%] sm:p-6 lg:basis-[32%]"
        >
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <div className="flex items-center gap-2.5 pt-1">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Inline review carousel — sits between the Detail grid and Rekomendasi with
 * matching section rhythm (`mt-13 md:mt-20`, no bottom margin — Rekomendasi
 * carries its own top margin). Swipeable on mobile, arrow-stepped on desktop.
 *
 * Visibility: offline (`data === null` from the hook, fetch `isError`, or
 * browser offline) hides the WHOLE section — no skeleton, no empty shell.
 * The loading state keeps the section header (mirrors Rekomendasi) so the
 * skeleton never appears as a headerless orphan mid-page.
 */
export function PackageReviews({ paketId, vm }: { paketId: number; vm: DetailViewModel }) {
  const reduced = useReducedMotion()
  const [formOpen, setFormOpen] = useState(false)
  const { data, isLoading, isError } = usePaketReviews(paketId)

  if (data === null || isError) return null
  if (typeof navigator !== "undefined" && !navigator.onLine) return null

  const reviews = data ?? []

  return (
    <motion.section
      aria-labelledby="ulasan-heading"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: LUXURY_EASE }}
      className="mt-13 flex w-full flex-col gap-8 px-6 md:mt-20 md:p-0 lg:gap-10"
    >
      <div className="flex flex-col gap-3 lg:gap-4">
        <p className="flex items-center gap-3.5 text-xs font-normal tracking-[0.3em] text-primary uppercase lg:text-[13px]">
          <span aria-hidden="true" className="h-px w-10 bg-primary lg:w-12" />
          Testimoni
        </p>
        <h2
          id="ulasan-heading"
          className="font-heading text-[clamp(28px,4vw,44px)] leading-tight font-light tracking-[-0.02em] text-foreground"
        >
          Ulasan <span className="font-accent text-primary italic">Pelanggan</span>
        </h2>
      </div>

      {isLoading ? (
        <CarouselSkeleton />
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border p-6 sm:p-8">
          <p className="text-sm text-muted-foreground">
            Belum ada ulasan untuk paket ini — jadilah yang pertama berbagi pengalaman.
          </p>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <HugeiconsIcon icon={MessageAdd01Icon} className="mr-2 size-4" />
            Tulis Ulasan
          </Button>
        </div>
      ) : (
        <>
          <Carousel
            opts={{ align: "start", containScroll: "trimSnaps" }}
            className="-mx-6 w-auto md:mx-0 md:w-full"
          >
            <CarouselContent className="ml-3 md:-ml-2">
              {reviews.map((review) => (
                <CarouselItem
                  key={review.id}
                  className="pl-3 basis-[80%] sm:basis-[55%] lg:basis-[32%]"
                >
                  <ReviewCard review={review} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CarouselPrevious className="static inset-auto my-0 hidden translate-none md:flex" />
                <CarouselNext className="static inset-auto my-0 hidden translate-none md:flex" />
              </div>
              <Button onClick={() => setFormOpen(true)} className="">
              <HugeiconsIcon icon={MessageAdd01Icon} className="mr-2 size-4" />
              Tulis Ulasan
            </Button>
            </div>
          </Carousel>
        </>
      )}

      <AddReviewDialog
        paketId={paketId}
        vm={vm}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </motion.section>
  )
}
