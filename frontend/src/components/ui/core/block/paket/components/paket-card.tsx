"use client"

import { Link } from "react-router"

import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import {
  Card,
  CardAction,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
} from "@/components/ui/fragments/shadcn-ui/card"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/fragments/shadcn-ui/tooltip"
import type { Paket } from "../types/paket-types"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUpRight01FreeIcons,
  Heart,
  Like,
  Package,
  Star,
} from "@hugeicons/core-free-icons"

/** Local product-art fallback while a paket has no Cloudinary thumbnail yet. */
const FALLBACK_IMAGE =
  "/assets/images/products/paket-nasi-box-hemat/paket-nasi-box-hemat-1.png"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import ShoppingCart from "@/components/svg/shopping-card-svg"
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

/**
 * PaketCard — one package in the catalog grid.
 *
 * Ultra-minimal: thumbnail, name, description, IDR price (`/ porsi`),
 * min_order caption, and the single data-driven "Best Seller" badge.
 * No ratings, no cart, no fake metrics — this is the conversion-first
 * catalog card per `design-system/pages/catalog.md`.
 */
export function PaketCard({
  paket,
  className,
}: {
  paket: Paket
  className?: string
}) {
  const href = `/paket/${paket.id}`
  const showcase_images = paket.images

  const category = paket.kategori_paket
  const IconProduct = getCategoryIcon(category)
  const ColorProduct = getCategoryColor(category)
  return (
    <Card
      className={cn(
        "m-auto h-full w-full max-w-sm gap-4 border-none bg-background p-0 shadow-none ring-0 outline-0 dark:bg-background"
      )}
    >
      <CardHeader
        className={cn(
          "group relative min-h-[16em] overflow-hidden rounded-lg bg-background px-0 md:min-h-[22em]",
          className
        )}
      >
        {paket.is_best_seller && (
          <Badge
            icon={Like}
            variant={"outline"}
            className={cn(
              "absolute top-2.5 left-2.5 z-30 w-fit gap-3 rounded-full border-0 text-accent-foreground shadow-none lg:text-xs [&_svg]:size-4",
              "[&_svg]:text-primary",
              "bg-background"
            )}
          >
            <span className="font-semibold">Best Seller</span>
          </Badge>
        )}
        {/* <Badge
          icon={IconProduct}
          variant="outline"
          className={cn(
            "absolute top-2.5 left-2.5 z-30 rounded-xl bg-muted text-[9px] font-semibold text-primary-foreground capitalize md:text-xs",
              ColorProduct,
            'bg-muted'
          )}
        >
          {category}
        </Badge> */}
        {/* <CardAction className="absolute right-0 bottom-0 flex h-full flex-col justify-between pt-1.5 md:pt-0">
          <Tooltip>
            <TooltipTrigger>
              <Button
                size={"sm"}
                variant={"ghost"}
                className={cn(
                  "z-40 rounded-full px-0 hover:bg-destructive md:py-5",

                  "transition-all duration-300 ease-out hover:text-destructive [&_svg]:fill-destructive hover:[&_svg]:fill-none hover:[&_svg]:text-accent"
                )}
              >
                <HugeiconsIcon
                  icon={Heart}
                  className={cn(
                    "border-white transition-all duration-300 ease-out",

                    "size-6 text-destructive"
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove from Whistlist</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button className="relative z-30 size-11 rounded-full text-white lg:size-13">
                <ShoppingCart strokeWidth={2} className="size-6 scale-105" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Order Cepat</p>
            </TooltipContent>
          </Tooltip>
          <div className="absolute right-0 bottom-0 z-20 size-14.5 lg:size-18">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 62 62"
              className="relative z-20"
            >
              <path
                d="M 36 10 L 52 10 C 57.523 10 62 5.523 62 0 L 62 62 L 0 62 C 5.523 62 10 57.523 10 52 L 10 36 C 10 22 22 10 36 10 Z"
                fill="var(--background)"
              />
            </svg>
          </div>
        </CardAction> */}

        <Link
          to={href}

          className="absolute h-full w-full cursor-zoom-in"
        >
          <MediaItem
            webViewLink={`${paket.thumbnail}`}

            className={cn(
              "h-full w-full rounded-2xl object-cover object-center opacity-100 transition-all duration-700 ease-out",

              showcase_images &&
                showcase_images.length > 0 &&
                "group-hover:opacity-0"
            )}
          />
        </Link>
        <Link to={href} className="absolute h-full w-full">
          {showcase_images && showcase_images.length > 0 && (
            <MediaItem
              webViewLink={`${showcase_images[1]}`}

              className="h-full w-full rounded-xl object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:opacity-100"
            />
          )}
        </Link>
      </CardHeader>
      <Link className="space-y-3 lg:space-y-4" to={href}>
        <CardContent className="mt-2 space-y-2 bg-background py-0 pr-2.5 pl-0">
          <Badge
            icon={IconProduct}
            variant={"outline"}
            className={cn(
              "w-fit gap-3 border-0 text-accent-foreground shadow-none lg:text-xs [&_svg]:size-4",

              ColorProduct,

              "hover: hover:bg-transparent"
            )}
          >
            <span className="font-medium">{paket.kategori_paket}</span>
          </Badge>
          {/* JUDUL PRODUK - Menggunakan Fraunces (Premium Vibe) */}
          <CardTitle className="line-clamp-1 font-heading text-base font-semibold tracking-tight text-foreground lg:text-lg">
            {paket.nama_paket}
          </CardTitle>
        </CardContent>

        <CardFooter className="bg-background p-0 text-left">
          <div className="flex flex-col gap-1.5">
            {/* HARGA - Menggunakan Space Grotesk (Clean Numbers) */}
            <h2 className="font-sans text-base font-semibold text-foreground md:text-lg">
              {formatIDR(paket.harga_per_porsi)}
              <span className="font-sans text-xs font-normal text-muted-foreground">
                {" "}
                / Porsi
              </span>
            </h2>

            {/* KEMASAN / DESKRIPSI - Menggunakan Icon biar lebih manis */}
            <div className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground md:text-sm">
              <HugeiconsIcon
                icon={Package}
                className="size-3.5 shrink-0 text-muted-foreground"
              />
              <p className="line-clamp-1">{paket.jenis_kemasan}</p>
            </div>
          </div>
        </CardFooter>
      </Link>
      {/* <Link to={`/paket/${paket.id}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <MediaItem
            webViewLink={paket.thumbnail || FALLBACK_IMAGE}
            className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {paket.is_best_seller && (
            <Badge className="absolute top-3 left-3 z-10">Best Seller</Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <h3 className="line-clamp-1 font-heading text-lg font-medium tracking-tight">
            {paket.nama_paket}
          </h3>
          {paket.deskripsi && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {paket.deskripsi}
            </p>
          )}

          <div className="mt-auto pt-2">
            <p className="text-lg font-semibold text-foreground">
              {formatIDR(paket.harga_per_porsi)}
              <span className="text-xs font-normal text-muted-foreground">
                {" "}
                / porsi
              </span>
            </p>
            {paket.min_order > 1 && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Min. {paket.min_order} porsi
              </p>
            )}
          </div>
        </div>
      </Link> */}
    </Card>
  )
}
