"use client"

import type { ReactNode } from "react"
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
import { HeartIcon } from "@hugeicons/core-free-icons"
import type { PaketLayoutMode } from "@/store/paket-layout-store"
import type { Paket } from "../types/paket-types"
import {
  getCategoryColor,
  getCategoryIcon,
  getAcaraColor,
  getAcaraIcon,
} from "../utils/paket-kategori-utils.ts"

/**
 * Rupiah formatting — `harga_per_porsi` is a `decimal:2` string from the API,
 * so it must be Number()-ed first.
 */
const formatIDR = (value: string | number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value))

const FALLBACK_IMG = "/assets/images/banners/hero-banner-tumpeng.png"

export function PaketCard({
  paket,
  className,
  layoutMode = "horizontal",
  adminActions,
  showSalesCount = false,
}: {
  paket: Paket
  className?: string
  layoutMode?: PaketLayoutMode
  adminActions?: ReactNode
  showSalesCount?: boolean
}) {
  const href = `/paket/${paket.id}`
  const showcase_images = paket.images ?? []
  const category = paket.kategori_paket
  const IconProduct = getCategoryIcon(category)
  const ColorProduct = getCategoryColor(category)

  const isHorizontal = layoutMode === "horizontal"
  const isCompact = layoutMode === "grid-3"

  const cardContent = (
    <Card
      className={cn(
        "group relative m-auto h-full w-full border-none bg-background p-0 shadow-none ring-0 outline-0 dark:bg-background",
        isHorizontal
          ? "mb-4 gap-6 md:flex-row md:items-stretch md:gap-9"
          : "flex-col gap-3",
        className
      )}
    >
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
              "absolute top-3 left-3 z-30 w-fit gap-2 rounded-full border-destructive bg-background px-3 py-1 text-destructive shadow-none lg:text-xs",
              "[&_svg]:size-3.5 [&_svg]:fill-destructive [&_svg]:text-destructive"
            )}
          >
            <span className="font-semibold">Best Seller</span>
          </Badge>
        )}

        {showSalesCount && paket.pesanan_count !== undefined && (
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 z-30 w-fit rounded-full bg-background/90 px-2.5 py-1 text-xs shadow-sm backdrop-blur"
          >
            {paket.pesanan_count} Terjual
          </Badge>
        )}

        <div className="absolute inset-0 block">
          <MediaItem
            webViewLink={paket.thumbnail ?? FALLBACK_IMG}
            className={cn(
              "h-full w-full object-cover object-center transition-opacity duration-700 ease-out",
              showcase_images.length > 0 && "group-hover:opacity-0"
            )}
          />
          {showcase_images.length > 0 && (
            <MediaItem
              webViewLink={showcase_images[0]}
              className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
            />
          )}
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          "flex flex-1 flex-col bg-background p-0",
          isHorizontal ? "gap-5 md:justify-center md:py-6" : "gap-4"
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-3",
            isHorizontal ? "md:gap-3" : "mt-2"
          )}
        >
          <div className="flex items-center gap-2">
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

            {paket.kategori_acara && (
              <Badge
                icon={getAcaraIcon(paket.kategori_acara)}
                variant="outline"
                className={cn(
                  "w-fit gap-1.5 border-0 text-xs shadow-none",
                  getAcaraColor(paket.kategori_acara)
                )}
              >
                <span className="font-medium">{paket.kategori_acara}</span>
              </Badge>
            )}
          </div>

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
            "bg-background p-0 text-left flex flex-col gap-3",
            isHorizontal ? "mt-auto" : "mt-1"
          )}
        >
          <div className="flex w-full flex-col gap-1">
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
              <p className="line-clamp-1">{paket.jenis_kemasan}</p>
            </div>
          </div>

          {adminActions && (
            <div
              className="flex w-full items-center justify-end gap-2 border-t border-border pt-3"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              {adminActions}
            </div>
          )}
        </CardFooter>
      </CardContent>
    </Card>
  )

  if (adminActions) {
    return <div className="h-full w-full">{cardContent}</div>
  }

  return (
    <Link to={href} aria-label={paket.nama_paket}>
      {cardContent}
    </Link>
  )
}
