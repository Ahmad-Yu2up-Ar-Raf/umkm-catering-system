"use client"

import { Link } from "react-router"

import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { Card } from "@/components/ui/fragments/shadcn-ui/card"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { cn } from "@/lib/utils"

import type { Paket } from "../types/paket-types"

/** Local product-art fallback while a paket has no Cloudinary thumbnail yet. */
const FALLBACK_IMAGE =
  "/assets/images/products/paket-nasi-box-hemat/paket-nasi-box-hemat-1.png"

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
  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-lg py-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <Link to={`/paket/${paket.id}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <MediaItem
            webViewLink={paket.thumbnail || FALLBACK_IMAGE}
            className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {paket.is_best_seller && (
            <Badge className="absolute top-3 left-3 z-10">
              Best Seller
            </Badge>
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
                {" "}/ porsi
              </span>
            </p>
            {paket.min_order > 1 && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Min. {paket.min_order} porsi
              </p>
            )}
          </div>
        </div>
      </Link>
    </Card>
  )
}
