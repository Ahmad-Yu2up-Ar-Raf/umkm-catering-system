"use client"

import { motion, type Variants } from "framer-motion"
import { Link } from "react-router"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight02Icon } from "@hugeicons/core-free-icons"
import { OriginButton } from "@/components/ui/fragments/custom-ui/button/cta-button"

import type { DetailViewModel } from "../utils/detail-view-model"

/** Canonical business WhatsApp number — identical across faq-data, catalog
 *  header and footer (see plan §13.1). */
const WHATSAPP_URL = "https://wa.me/6287870306031"

/** Premium ease — Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/**
 * Grouped reveal — three decision groups + description. Each group animates
 * as ONE node (identity / price-terms / CTA-meta / description); never
 * per-icon, per-line or per-badge. Reduced motion → opacity only.
 */
function itemVariant(reduced: boolean): Variants {
  return {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: LUXURY_EASE },
    },
  }
}

/**
 * DetailSummary — the decision rail: identity → price/terms → CTA + meta →
 * description. Editorial whitespace and hairlines, never card-inside-card.
 */
export function DetailSummary({ vm }: { vm: DetailViewModel }) {
  const reduced = useReducedMotion()
  const item = itemVariant(reduced)

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
      className="flex h-full flex-col gap-7 lg:gap-8"
    >
      {/* identity */}
      <motion.div variants={item} className="flex flex-col gap-3">
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
        <h1 className="font-heading text-[clamp(30px,3.6vw,40px)] leading-tight font-semibold tracking-tight text-foreground">
          {vm.name}
        </h1>
        {(vm.bestSeller || vm.metaRows.length > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            {vm.bestSeller && (
              <Badge variant="secondary" size="lg">
                Best Seller
              </Badge>
            )}
          </div>
        )}
      </motion.div>

      {/* price / terms */}
      {/* <motion.div variants={item} className="flex flex-col gap-1.5">
        {vm.hasPrice ? (
          <>
            <p className="font-sans text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {vm.priceLabel}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / porsi
              </span>
            </p>
            {vm.minOrderLabel && (
              <p className="text-sm text-muted-foreground">
                {vm.minOrderLabel}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Harga tersedia saat konsultasi
          </p>
        )}
      </motion.div> */}

      {/* CTA + meta */}
      {/* <motion.div variants={item} className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row">
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
          <Link
            to="/paket"
            className="inline-flex h-12 w-full items-center justify-center rounded-[100px] border border-border px-6 text-xs tracking-widest text-foreground uppercase transition-colors duration-300 hover:bg-accent sm:w-fit"
          >
            <span>Kembali ke katalog</span>
          </Link>
        </div>

        {vm.metaRows.length > 0 && (
          <dl className="flex flex-col gap-2.5 border-t border-border pt-5">
            {vm.metaRows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-6"
              >
                <dt className="text-[11px] tracking-wider text-muted-foreground uppercase">
                  {row.label}
                </dt>
                <dd className="text-sm text-right font-medium text-foreground">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </motion.div> */}

      {/* description — editorial, full prose (seed descriptions are 1–2 lines) */}
      {/* {vm.description && (
        <motion.div variants={item} className="flex flex-col gap-4">
          <div aria-hidden="true" className="h-px w-full bg-border" />
          <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {vm.description}
          </p>
        </motion.div>
      )} */}
    </motion.div>
  )
}
