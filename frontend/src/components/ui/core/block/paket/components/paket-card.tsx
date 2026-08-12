import { motion } from "framer-motion"
import { Link } from "react-router"

import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { cn } from "@/lib/utils"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import type { Paket } from "../types/paket-types"
import {
  getCategoryColor,
  getCategoryIcon,
} from "../utils/paket-kategori-utils.ts"
import { batasiKata } from "@/hooks/use-word.ts"

const formatIDR = (value: string | number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value))

export function PaketCard({
  paket,
  className,
  layoutMode = "horizontal",
}: {
  paket: Paket
  className?: string
  layoutMode?: "horizontal" | "grid-2" | "grid-3"
}) {
  const href = `/paket/${paket.id}`
  const category = paket.kategori_paket
  const IconProduct = getCategoryIcon(category)
  const ColorProduct = getCategoryColor(category)
  const title = batasiKata(paket.nama_paket, 3)

  const isHorizontal = layoutMode === "horizontal"
  const isCompact = layoutMode === "grid-3"

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group relative w-full overflow-hidden rounded-3xl bg-secondary/40 p-5 transition-shadow hover:shadow-2xl",
        isHorizontal ? "sm:flex-row" : "flex-col",
        className
      )}
    >
      <Link to={href} className={cn("flex relative gap-4 z-30 h-full w-full", isHorizontal ? "flex-col sm:flex-row" : "flex-col")}>
        {/* Thumbnail */}
        <div className={cn(
          "relative h-64 rounded-2xl w-full shrink-0 overflow-hidden",
          isHorizontal ? "sm:w-80" : "w-full"
        )}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full w-full"
          >
            <MediaItem
              webViewLink={`${paket.thumbnail}`}
              className="h-full w-full object-cover object-center"
            />
          </motion.div>
        </div>

        {/* Content */}
        <div className={cn("relative flex flex-1 flex-col", isHorizontal ? "justify-between p-6 sm:px-7" : "p-4")}>
          <div className="Z-30 max-w-sm space-y-4">
            <Badge
              icon={IconProduct}
              variant="outline"
              className={cn(
                "w-fit gap-2 border-none text-accent-foreground shadow-none lg:text-xs",
                ColorProduct
              )}
            >
              <span className="font-medium">{category}</span>
            </Badge>
            <h3 className={cn("font-heading font-semibold tracking-tight text-foreground", isCompact ? "text-lg" : "text-xl md:text-3xl")}>
              {title}
            </h3>
            {!isCompact && (
              <p className="line-clamp-2 text-base leading-relaxed text-muted-foreground">
                {paket.deskripsi}
              </p>
            )}
          </div>

          <div className="relative z-30 mt-8 flex items-center justify-end">
            <p className="font-sans text-xl font-semibold text-foreground">
              {formatIDR(paket.harga_per_porsi)}
              <span className="text-xs font-normal text-muted-foreground">
                {" "}
                / porsi
              </span>
            </p>
          </div>
        </div>
      </Link>
      <div
        aria-hidden="true"
        className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-background)_100%,transparent),transparent_90%)]"
      />
    </motion.div>
  )
}
