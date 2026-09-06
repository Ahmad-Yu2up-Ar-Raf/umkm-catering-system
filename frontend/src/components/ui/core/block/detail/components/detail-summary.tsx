"use client"

import { useState } from "react"
import { motion, type Variants } from "framer-motion"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useShare } from "@/hooks/use-share"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/fragments/shadcn-ui/dialog"
import { Separator } from "@/components/ui/fragments/shadcn-ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LeafIcon,
  Share08FreeIcons,
  ShoppingCart,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"

import type { DetailViewModel } from "../utils/detail-view-model"
import { DetailMenu } from "./detail-menu"
import { DetailFacilities } from "./detail-facilities"
import { OrderCalculationDialog } from "./order-calculation-dialog"
import { ShareDialog } from "@/components/ui/fragments/custom-ui/share-dialog"
import { OriginButton } from "@/components/ui/fragments/custom-ui/button/cta-button"

/** Premium ease — Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/** Grouped reveal — each section animates as ONE node. Reduced → opacity. */
function itemVariant(reduced: boolean): Variants {
  return {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: LUXURY_EASE },
    },
  }
}

/**
 * DetailSummary — the full right rail of the two-column layout.
 *
 * Logical hierarchy, hairline-divided, consistent `gap-5/6` rhythm:
 *   badges (+ share action) → bold title → price + WhatsApp CTA →
 *   description → Menu → Facilities → Metadata (Acara/Kemasan/Kapasitas) →
 *   Bahan & Alergen.
 *
 * Sharing: the top-right button uses the native Web Share API where available
 * and falls back to the Shadcn `ShareDialog` (social links + copy link) on
 * desktop. The shared URL is the current canonical package route.
 */
export function DetailSummary({ vm }: { vm: DetailViewModel }) {
  const reduced = useReducedMotion()
  const item = itemVariant(reduced)
  const hasFacilities = Boolean(vm.facilities?.length)
  const reveal = (amount = 0.2) =>
    ({
      initial: reduced ? { opacity: 0 } : { opacity: 0, y: 16 },
      whileInView: reduced ? { opacity: 1 } : { opacity: 1, y: 0 },
      viewport: { once: true, amount },
      transition: { duration: 0.5, ease: LUXURY_EASE },
    }) as const

  const { isOpen, payload, share, close } = useShare()

  // Order modal — transient UI state, local to this block (no store needed).
  const [orderOpen, setOrderOpen] = useState(false)

  const sharePackage = () =>
    void share({
      title: vm.name,
      text:
        vm.description?.slice(0, 160) ??
        `Paket ${vm.categoryLabel} dari Catering Nusantara`,
      url: window.location.href,
    })

  return (
    <div className="flex w-full flex-col gap-6 px-6 md:gap-6 md:p-0 lg:py-3">
      {/* top decision block — grouped mount reveal */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
        className="flex w-full flex-col gap-6 md:gap-10"
      >
        {/* badges + title */}
        <motion.div variants={item} className="flex flex-col gap-3 md:gap-5">
          <div className="flex w-full justify-between">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge
                icon={vm.categoryIcon}
                variant="outline"
                className={cn(
                  "w-fit gap-2 border-0 text-accent-foreground shadow-none lg:text-xs [&_svg]:size-4",
                  vm.categoryColor,
                  "hover:bg-transparent"
                )}
              >
                <span className="font-medium">{vm.categoryLabel}</span>
              </Badge>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-secondary/40"
              aria-label="Bagikan paket"
              onClick={sharePackage}
            >
              <HugeiconsIcon className="size-5" icon={Share08FreeIcons} />
            </Button>
          </div>

          <h1 className="font-heading text-[clamp(27px,3.4vw,40px)] leading-[1.08] font-semibold tracking-tight text-foreground">
            {vm.name}
          </h1>
        </motion.div>

        {/* price + full-width CTA */}
        <motion.div variants={item} className="flex flex-col gap-5">
          <div className="space-y-1">
            {vm.hasPrice && (
              <p className="font-sans text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {vm.priceLabel}
                <span className="text-sm font-normal text-muted-foreground md:text-base">
                  {" "}
                  / porsi
                </span>
              </p>
            )}
            {vm.minOrderLabel && (
              <p className="text-sm text-muted-foreground md:text-base">
                {vm.minOrderLabel}
              </p>
            )}
          </div>
          {/* Pesan via WhatsApp → opens the live order calculation modal.
              DialogContent renders via Radix Portal (outside this motion
              group), so the entrance animation of the summary is untouched. */}
          <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
            <DialogTrigger asChild>
              <OriginButton
                intensity={0.8}
                range={120}
                className="group border border-primary/40 bg-primary text-xs tracking-widest text-primary-foreground uppercase sm:border-2 sm:border-primary md:bg-transparent md:text-primary"
              >
                <HugeiconsIcon icon={ShoppingCart} className="size-5" />
                Pesan Sekarang
              </OriginButton>
            </DialogTrigger>
            <OrderCalculationDialog
              open={orderOpen}
              onOpenChange={setOrderOpen}
              vm={vm}
            />
          </Dialog>
        </motion.div>
      </motion.div>

      {/* description */}
      {vm.description && (
        <>
          <Separator />
          <motion.div variants={item}>
            <p className="max-w-2xl text-sm leading-relaxed text-foreground/90 md:text-[17px]">
              {vm.description}
            </p>
          </motion.div>
        </>
      )}

      {/* metadata — Acara → Kemasan → Kapasitas */}
      {vm.metaRows.length > 0 && (
        <>
          <Separator />
          <motion.div {...reveal()} className="flex flex-col gap-3.5 md:gap-6">
            {vm.metaRows.map((row) => (
              <div key={row.key} className="flex items-center gap-3 md:gap-4">
                <dt className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase md:text-xs">
                  {row.label}
                </dt>
                <dd className="ml-auto text-right text-xs font-medium text-foreground md:text-[15px]">
                  {row.value}
                </dd>
              </div>
            ))}
          </motion.div>
        </>
      )}

      {/* hairline-divided lower sections */}
      <Separator />
      <DetailMenu vm={vm} />

      {hasFacilities && (
        <>
          <Separator />
          <DetailFacilities vm={vm} />
        </>
      )}

      {/* Bahan & Alergen — very bottom */}

      <Separator />
      <motion.div {...reveal()} className="flex gap-5">
        <HugeiconsIcon icon={LeafIcon} className="size-5 hidden sm:block text-primary/80" />
        <div className="flex flex-col gap-2">
          <h2 className="items-center font-sans text-sm font-semibold tracking-[0.2em] text-foreground uppercase">
            Bahan & Alergen
          </h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground md:text-base">
            {vm.allergenNote || "Tanpa pengawet, dimasak hari yang sama"}
          </p>
        </div>
      </motion.div>

      <Separator />

      {/* Desktop fallback share surface (Web Share API unavailable) */}
      <ShareDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) close()
        }}
        payload={payload}
      />
    </div>
  )
}
