"use client"

import { Link } from "react-router"

import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
} from "@/components/ui/fragments/shadcn-ui/card"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { HeartIcon, Package01Icon } from "@hugeicons/core-free-icons"
import type { Paket } from "../types/paket-types"
import {
  getCategoryColor,
  getCategoryIcon,
} from "../utils/paket-kategori-utils.ts"

/**
 * Rupiah formatting — `harga_per_porsi` is a `decimal:2` string from the API,
 * so it must be Number()-ed first. Single purpose, lives with its one consumer.
 */
const formatIDR = (value: string | number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value))

export type PaketLayoutMode = "horizontal" | "grid-2" | "grid-3"

/**
 * PaketCard — one package in the catalog, adapting to three layout modes:
 *
 * - `horizontal` (1-col editorial): media left, full content right,
 *   `md:flex-row md:items-center`.
 * - `grid-2` (balanced showcase): vertical stack, `min-h-[16em] md:min-h-[20em]`
 *   media, full content.
 * - `grid-3` (compact catalog): vertical stack, description omitted so card
 *   heights stay aligned.
 *
 * Base container is deliberately undecorated (`border-none bg-background p-0
 * shadow-none ring-0 outline-0`) — the typography and imagery carry the
 * premium feel. Hover crossfades the primary thumbnail into the first
 * showcase image.
 */
export function PaketCard({
  paket,
  className,
  layoutMode = "horizontal",
}: {
  paket: Paket
  className?: string
  layoutMode?: PaketLayoutMode
}) {
  const href = `/paket/${paket.id}`
  const showcase_images = paket.images
  const category = paket.kategori_paket
  const IconProduct = getCategoryIcon(category)
  const ColorProduct = getCategoryColor(category)

  const isHorizontal = layoutMode === "horizontal"
  const isCompact = layoutMode === "grid-3"

  return (
    <Link to={href} aria-label={paket.nama_paket}>
      <Card
        className={cn(
          "group m-auto h-full w-full border-none bg-background p-0 shadow-none ring-0 outline-0 dark:bg-background",
          isHorizontal
            ? "mb-4 gap-6 md:flex-row md:items-stretch md:gap-9"
            : "flex-col gap-3",
          className
        )}
      >
        {/* Media — horizontal: width-constrained (35–40%), height follows the
          content column so the card is shaped by its copy, never the image.
          Grid modes: full-width with a calibrated aspect floor. */}
        <CardHeader
          className={cn(
            "relative w-full shrink-0 overflow-hidden rounded-2xl bg-background p-0",
            isHorizontal
              ? "aspect-[16/10] md:aspect-[16/13] md:h-full md:w-[40%] md:max-w-sm xl:w-[35%]"
              : "min-h-[16em] md:min-h-[20em]"
          )}
        >
          {paket.is_best_seller && (
            <Badge
              icon={HeartIcon}
              variant="outline"
              className={cn(
                "absolute top-3 left-3 z-30 w-fit gap-2 rounded-full border-0 bg-background px-3 py-1 text-accent-foreground shadow-none lg:text-xs",
                "[&_svg]:size-3.5 [&_svg]:text-primary"
              )}
            >
              <span className="font-semibold">Best Seller</span>
            </Badge>
          )}

          <div className="absolute inset-0 block">
            <MediaItem
              webViewLink={paket.thumbnail}
              className={cn(
                "h-full w-full object-cover object-center transition-opacity duration-700 ease-out",
                showcase_images.length > 0 && "group-hover:opacity-0"
              )}
            />
            {showcase_images.length > 0 && (
              <MediaItem
                webViewLink={showcase_images[1]}
                className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
              />
            )}
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent
          className={cn(
            "flex flex-1 flex-col bg-background p-0",
            isHorizontal ? "gap-5 md:justify-center md:py-6" : "gap-4"
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-4",
              isHorizontal ? "md:gap-3" : "mt-3"
            )}
          >
            <Badge
              icon={IconProduct}
              variant="outline"
              className={cn(
                "w-fit gap-2 border-0 text-accent-foreground shadow-none lg:text-xs [&_svg]:size-4",
                ColorProduct,
                "hover:bg-transparent"
              )}
            >
              <span className="font-medium">{category}</span>
            </Badge>

            <CardTitle
              className={cn(
                "line-clamp-1 font-heading font-semibold tracking-tight text-foreground",
                isHorizontal ? "text-lg md:text-xl xl:text-2xl" : "text-xl"
              )}
            >
              {paket.nama_paket}
            </CardTitle>

            {!isCompact && (
              <p
                className={cn(
                  "line-clamp-2 leading-relaxed text-muted-foreground",
                  isHorizontal ? "max-w-xl text-sm md:text-base" : "text-sm"
                )}
              >
                {paket.deskripsi}
              </p>
            )}
          </div>

          <CardFooter
            className={cn(
              "bg-background p-0 text-left",
              isHorizontal ? "mt-auto" : "mt-1"
            )}
          >
            <div className="flex w-full flex-col gap-1.5">
              <h2
                className={cn(
                  "font-sans font-semibold text-foreground",
                  isHorizontal ? "text-lg md:text-xl" : "text-base md:text-lg"
                )}
              >
                {formatIDR(paket.harga_per_porsi)}
                <span className="font-sans text-xs font-normal text-muted-foreground">
                  {" "}
                  / Porsi
                </span>
              </h2>
              <div className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground md:text-sm">
                <HugeiconsIcon
                  icon={Package01Icon}
                  className="size-3.5 shrink-0 text-muted-foreground"
                />
                <p className="line-clamp-1">{paket.jenis_kemasan}</p>
              </div>
            </div>
          </CardFooter>
        </CardContent>
      </Card>
    </Link>
  )
}
