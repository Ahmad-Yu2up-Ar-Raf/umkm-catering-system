"use client"

import { motion, type Variants } from "framer-motion"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { Separator } from "@/components/ui/fragments/shadcn-ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight02Icon } from "@hugeicons/core-free-icons"
import { OriginButton } from "@/components/ui/fragments/custom-ui/button/cta-button"

import type { DetailViewModel } from "../utils/detail-view-model"
import { DetailMenu } from "./detail-menu"
import { DetailFacilities } from "./detail-facilities"

/** Canonical business WhatsApp number — identical across faq-data, catalog
 *  header and footer (see plan §13.1). */
const WHATSAPP_URL = "https://wa.me/6287870306031"

/** Premium ease — Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/** Grouped reveal — each section animates as ONE node (never per-line, per-
 *  badge or per-icon). Reduced motion → opacity only. */
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
 * Information hierarchy (top → bottom):
 *   identity + price + CTA → prominent description → metadata
 *   (packaging/capacity) → Menu list → Facilities.
 * Menu and Facilities live HERE (inside the rail), hairline-divided.
 */
export function DetailSummary({ vm }: { vm: DetailViewModel }) {
  const reduced = useReducedMotion()
  const item = itemVariant(reduced)

  return (
    <div className="flex w-full flex-col gap-6 lg:py-2 lg:gap-7">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
        className="flex flex-col gap-6 lg:gap-7"
      >
        {/* identity + price + CTA */}
        <motion.div variants={item} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
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
            <h1 className="font-heading text-[clamp(30px,3.6vw,40px)] leading-tight tracking-tight text-foreground">
              {vm.name}
            </h1>
            {vm.bestSeller && (
              <Badge variant="secondary" size="lg" className="w-fit">
                Best Seller
              </Badge>
            )}
          </div>

          {vm.hasPrice && (
            <p className="font-sans text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {vm.priceLabel}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / porsi
              </span>
              {vm.minOrderLabel && (
                <span className="block pt-1 text-sm font-normal text-muted-foreground">
                  {vm.minOrderLabel}
                </span>
              )}
            </p>
          )}

          <OriginButton
            intensity={0.8}
            range={120}
            onClick={() =>
              window.open(
                `${WHATSAPP_URL}?text=${encodeURIComponent(vm.waMessage)}`,
                "_blank",
                "noopener"
              )
            }
            className="group w-full text-xs tracking-widest uppercase"
          >
            Pesan via WhatsApp
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              className="size-4 fill-none transition-transform duration-700 ease-out group-hover:translate-x-1"
            />
          </OriginButton>
        </motion.div>

        {/* description — prominent, readable */}
        {vm.description && (
          <motion.div variants={item} className="flex flex-col gap-3">
            <p className="max-w-2xl text-[16px] leading-relaxed text-foreground md:text-[17px]">
              {vm.description}
            </p>
          </motion.div>
        )}

        {/* metadata — packaging, capacity, event fit */}
        {vm.metaRows.length > 0 && (
          <motion.div variants={item} className="border-t border-border pt-5">
            <dl className="flex flex-col gap-3">
              {vm.metaRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-6"
                >
                  <dt className="text-[11px] tracking-wider text-muted-foreground uppercase">
                    {row.label}
                  </dt>
                  <dd className="text-right text-sm font-medium text-foreground">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
      </motion.div>

      <Separator className="my-1" />

      {/* menu + facilities — the lower half of the right rail */}
      <DetailMenu vm={vm} />
      <DetailFacilities vm={vm} />
    </div>
  )
}
