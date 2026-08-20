"use client"

import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { HeartIcon, PlateIcon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/fragments/shadcn-ui/avatar"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { formatIDR } from "../utils/paket-format"
import type { Paket } from "../../../paket/types/paket-types"

interface PaketCardGridProps {
  items: Paket[]
  onEdit: (paket: Paket) => void
  onDelete: (paket: Paket) => void
}

/**
 * Compact admin card view — the view-toggle alternative to PaketTable. Each card
 * keeps the same data as a table row but reads faster at a glance.
 */
export function PaketCardGrid({ items, onEdit, onDelete }: PaketCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((paket) => (
        <article
          key={paket.id}
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="aspect-[4/3] w-full overflow-hidden bg-muted/30">
            {paket.thumbnail ? (
              <MediaItem
                webViewLink={paket.thumbnail}
                alt={paket.nama_paket}
                layout="fullWidth"
                width={560}
                height={420}
                className="size-full"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <Avatar className="size-14 rounded-xl bg-accent">
                  <AvatarFallback className="bg-transparent text-muted-foreground">
                    <HugeiconsIcon icon={PlateIcon} className="size-7" />
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-heading text-base font-medium text-foreground">
                  {paket.nama_paket}
                </h3>
                <p className="truncate text-xs text-muted-foreground">
                  {paket.kategori_paket}
                  {paket.kategori_acara ? ` · ${paket.kategori_acara}` : ""}
                </p>
              </div>
              <Badge variant="outline" icon={HeartIcon}>
                {paket.pesanan_count}x
              </Badge>
            </div>

            <p className="text-lg font-semibold tabular-nums text-primary">
              {formatIDR(paket.harga_per_porsi)}
              <span className="text-xs font-normal text-muted-foreground">
                {" "}/ porsi
              </span>
            </p>

            {paket.is_best_seller && (
              <Badge variant="secondary" icon={HeartIcon}>
                Best Seller
              </Badge>
            )}

            <p className="text-xs text-muted-foreground">
              Dibuat {paket.created_at ? format(new Date(paket.created_at), "dd MMM yyyy") : "—"}
            </p>

            <div className="mt-auto flex items-center justify-end gap-2 border-t border-border pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => onEdit(paket)}
              >
                Ubah
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit text-destructive hover:text-destructive"
                onClick={() => onDelete(paket)}
                disabled={paket.pesanan_count > 0}
              >
                Hapus
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
