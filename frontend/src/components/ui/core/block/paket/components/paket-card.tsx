"use client"

import type { ReactNode } from "react"
import { Link } from "react-router"

import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/fragments/shadcn-ui/tooltip"
import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
} from "@/components/ui/fragments/shadcn-ui/card"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { cn } from "@/lib/utils"
import { toggleSavedWithFeedback } from "@/lib/wishlist-feedback"
import { HeartIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { StarIcon } from "@hugeicons/core-free-icons"
import type { PaketLayoutMode } from "@/store/paket-layout-store"
import { useSavedPaketStore } from "@/store/saved-paket-store"
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
  priority = false,
}: {
  paket: Paket
  className?: string
  layoutMode?: PaketLayoutMode
  adminActions?: ReactNode
  showSalesCount?: boolean
  priority?: boolean
}) {
  const href = `/paket/${paket.id}`
  const showcase_images = paket.images ?? []
  const category = paket.kategori_paket
  const IconProduct = getCategoryIcon(category)
  const ColorProduct = getCategoryColor(category)

  const isHorizontal = layoutMode === "horizontal"
  const isCompact = layoutMode === "grid-3"

  // Wishlist — subscribes to this card's own saved status only (other cards
  // toggling does not re-render this one). Hidden on admin cards.
  const isSaved = useSavedPaketStore((s) => s.savedIds.includes(paket.id))
  const showSaveButton = !adminActions

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
        {showSaveButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-pressed={isSaved}
                aria-label={isSaved ? "Hapus dari simpanan" : "Simpan paket"}
                onClick={(e) => {
                  // The whole card is a <Link> — guard so saving never
                  // navigates (same precedent as the `adminActions` wrapper
                  // below). Stays on the Button: Trigger only forwards.
                  e.preventDefault()
                  e.stopPropagation()
                  toggleSavedWithFeedback(paket.id)
                }}
                className="absolute top-2 right-2 z-30 size-9 rounded-full bg-background/70 shadow-none backdrop-blur-sm hover:bg-background/80"
              >
                <HugeiconsIcon
                  icon={HeartIcon}
                  className={cn(
                    "size-4",
                    isSaved && "fill-destructive text-destructive"
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isSaved ? "Tersimpan — klik untuk hapus" : "Simpan paket"}
            </TooltipContent>
          </Tooltip>
        )}

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
            className={cn(
              "absolute top-3 z-30 w-fit rounded-full bg-background/90 px-2.5 py-1 text-xs shadow-sm backdrop-blur",
              // Yields the top-right corner to the save heart when visible.
              showSaveButton ? "right-14" : "right-3"
            )}
          >
            {paket.pesanan_count} Terjual
          </Badge>
        )}

        <div className="absolute inset-0 block">
          <MediaItem
            webViewLink={paket.thumbnail ?? FALLBACK_IMG}
            alt={paket.nama_paket}
            width={640}
            height={480}
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            priority={priority}
            className={cn(
              "h-full w-full object-cover object-center transition-opacity duration-700 ease-out",
              showcase_images.length > 0 && "group-hover:opacity-0"
            )}
          />
          {showcase_images.length > 0 && (
            <MediaItem
              webViewLink={showcase_images[0]}
              alt={paket.nama_paket}
              width={640}
              height={480}
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
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
          <div className="flex items-center justify-between gap-1">
            <span className="flex min-w-0 items-center gap-1">
              <Badge
                icon={IconProduct}
                variant="outline"
                className={cn(
                  "w-fit gap-1 border-0 text-[11px] text-accent-foreground shadow-none lg:text-[11px] [&_svg]:size-3.5",
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
                    "w-fit gap-1 border-0 text-[11px] shadow-none [&_svg]:size-3.5",
                    getAcaraColor(paket.kategori_acara)
                  )}
                >
                  <span className="font-medium">{paket.kategori_acara}</span>
                </Badge>
              )}
            </span>

            {(paket.testimoni_count ?? 0) > 0 && paket.rating_avg != null && (
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium whitespace-nowrap text-amber-700 dark:text-amber-400">
                <HugeiconsIcon
                  icon={StarIcon}
                  className="size-3.5 fill-amber-400 text-amber-400"
                />
                {paket.rating_avg} ({paket.testimoni_count})
              </span>
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
                isHorizontal ? "text-lg md:text-xl" : "text-lg"
              )}
            >
              {formatIDR(paket.harga_per_porsi)}
              <span className="font-sans text-xs font-normal text-muted-foreground">
                {" "}
                / Porsi
              </span>
            </h2>
            <div className="flex items-center gap-1.5 font-sans   text-muted-foreground text-sm">
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
