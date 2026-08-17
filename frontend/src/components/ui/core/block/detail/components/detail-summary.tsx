"use client"

import { motion, type Variants } from "framer-motion"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { Separator } from "@/components/ui/fragments/shadcn-ui/separator"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  HeartIcon,
  LeafIcon,
  Party,
  PlateIcon,
  ServingFoodFreeIcons,
  Share,
  Share02Icon,
  Share08FreeIcons,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"

import type { DetailViewModel, DetailMetaRow } from "../utils/detail-view-model"
import { DetailMenu } from "./detail-menu"
import { DetailFacilities } from "./detail-facilities"
import { OriginButton } from "@/components/ui/fragments/custom-ui/button/cta-button"
import { BUSINESS_NUMBER, getWhatsAppLink } from "@/lib/whatsapp"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"

/** Premium ease — Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/** Meta row icons — Acara / Kemasan / Kapasitas, matched by the VM row key. */
const META_ICONS: Record<DetailMetaRow["key"], IconSvgElement> = {
  event: Party,
  packaging: ServingFoodFreeIcons,
  capacity: PlateIcon,
}

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
 *   badges → bold title → price + full-width WhatsApp CTA → description →
 *   Menu → Facilities & Ketentuan → Metadata (Acara/Kemasan/Kapasitas) →
 *   Bahan & Alergen (flex-col, at the very bottom).
 * Hugeicons on headers only; lists use bullet markers.
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

  // WhatsApp deep link — pre-filled with the package-specific message from
  // the view model; phone number comes from `.env` (VITE_BUSINESS_NUMBER).
  const whatsappHref = getWhatsAppLink(BUSINESS_NUMBER, vm.waMessage)

  return (
    <div className="flex w-full flex-col gap-5 md:gap-6 lg:py-3">
      {/* top decision block — grouped mount reveal */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
        className="flex w-full flex-col gap-5 md:gap-10"
      >
        {/* badges + title */}
        <motion.div variants={item} className="flex flex-col gap-4">
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
              {/* {vm.bestSeller && (
                <Badge
                  icon={HeartIcon}
                  variant="outline"
                  className={cn(
                    "top-3 left-3 z-30 w-fit gap-2 rounded-full border-0 bg-background px-3 py-1 text-accent-foreground shadow-none ring ring-ring/20 lg:text-xs",
                    "[&_svg]:size-3.5 [&_svg]:fill-destructive [&_svg]:text-destructive"
                  )}
                >
                  <span className="font-semibold">Best Seller</span>
                </Badge>
              )} */}
            </div>
            <Button
              variant={"outline"}
              className="bg-background"
              size={"icon-lg"}
            >
              <HugeiconsIcon className="size-5" icon={Share08FreeIcons} />
            </Button>
          </div>

          <h1 className="font-heading text-[clamp(28px,3.4vw,40px)] leading-[1.08] font-semibold tracking-tight text-foreground">
            {vm.name}
          </h1>
        </motion.div>

        {/* price + full-width CTA */}
        <motion.div variants={item} className="flex flex-col gap-5">
          <div className="space-y-2">
            {vm.hasPrice && (
              <p className="font-sans text-3xl font-semibold tracking-tight text-foreground md:text-3xl">
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
          <OriginButton
            href={whatsappHref}
            intensity={0.8}
            range={120}
            className="group w-full text-xs tracking-widest uppercase md:bg-secondary/20"
          >
            <HugeiconsIcon icon={WhatsappIcon} className="size-5" />
            Pesan via WhatsApp
          </OriginButton>
          {/* <Button
            type="button"
            size="lg"
            variant="default"
            onClick={openWhatsApp}
            className="h-12 w-full gap-2 rounded-full text-xs tracking-widest uppercase"
          >
            <HugeiconsIcon icon={WhatsappIcon} className="size-5" />
            Pesan via WhatsApp
          </Button> */}
        </motion.div>
        {/* description */}
      </motion.div>
      {vm.description && (
        <>
          <Separator />
          <motion.div variants={item}>
            <p className="max-w-2xl text-base leading-relaxed text-foreground/90 md:text-[17px]">
              {vm.description}
            </p>
          </motion.div>
        </>
      )}
      {vm.metaRows.length > 0 && (
        <>
          <Separator />
          <motion.div {...reveal()} className="flex flex-col gap-3.5 md:gap-6">
            {vm.metaRows.map((row) => (
              <div key={row.key} className="flex items-center gap-3 md:gap-4">
                {/* <HugeiconsIcon
                  icon={META_ICONS[row.key]}
                  className="size-[18px] shrink-0 text-primary/80 md:size-5"
                /> */}
                <dt className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase md:text-xs">
                  {row.label}
                </dt>
                <dd className="ml-auto text-right text-sm font-medium text-foreground md:text-[15px]">
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

      {/* metadata — Acara → Kemasan → Kapasitas (moved below facilities) */}

      {/* Bahan & Alergen — very bottom, flex-col */}
      {vm.allergenNote && (
        <>
          <Separator />
          <motion.div {...reveal()} className="flex gap-5">
            <HugeiconsIcon icon={LeafIcon} className="size-5 text-primary/80" />
            <div className="flex flex-col gap-2">
              <h2 className="items-center font-sans text-sm font-semibold tracking-[0.2em] text-foreground uppercase">
                Bahan & Alergen
              </h2>
              <p className="text-[15px] leading-relaxed text-muted-foreground md:text-base">
                {vm.allergenNote}
              </p>
            </div>
          </motion.div>
        </>
      )}
      <Separator className="opacity-50" />
    </div>
  )
}
