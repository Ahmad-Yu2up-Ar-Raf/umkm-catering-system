"use client"

import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { HeartIcon, PlateIcon } from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback } from "@/components/ui/fragments/shadcn-ui/avatar"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/fragments/shadcn-ui/table"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { RowActions } from "@/components/ui/fragments/custom-ui/table/row-actions"
import { formatIDR } from "../utils/paket-format"
import type { Paket } from "../../../paket/types/paket-types"

interface PaketTableProps {
  items: Paket[]
  onEdit: (paket: Paket) => void
  onDelete: (paket: Paket) => void
}

/**
 * Admin paket list — first column pairs an Avatar thumbnail (via MediaItem) with
 * the package name; key attributes as badges; row actions stacked on the right.
 */
export function PaketTable({ items, onEdit, onDelete }: PaketTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paket</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead>Harga / Porsi</TableHead>
          <TableHead>Min. Order</TableHead>
          <TableHead>Pesanan</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Dibuat</TableHead>
          <TableHead>
            <span className="sr-only">Aksi</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((paket) => (
          <TableRow key={paket.id} className="group">
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="size-10 shrink-0 rounded-xl border border-border bg-muted/40">
                  {paket.thumbnail ? (
                    <MediaItem
                      webViewLink={paket.thumbnail}
                      alt={paket.nama_paket}
                      layout="constrained"
                      width={80}
                      height={80}
                      className="size-full"
                    />
                  ) : (
                    <AvatarFallback className="rounded-xl text-muted-foreground">
                      <HugeiconsIcon icon={PlateIcon} className="size-5" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {paket.nama_paket}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {paket.kategori_paket}
                    {paket.kategori_acara ? ` · ${paket.kategori_acara}` : ""}
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <Badge variant="secondary" className="whitespace-nowrap capitalize">
                {paket.kategori_paket}
              </Badge>
            </TableCell>

            <TableCell className="font-medium tabular-nums whitespace-nowrap">
              {formatIDR(paket.harga_per_porsi)}
            </TableCell>

            <TableCell className="tabular-nums whitespace-nowrap">
              {paket.min_order}
            </TableCell>

            <TableCell className="tabular-nums text-muted-foreground">
              {paket.pesanan_count ?? 0}x
            </TableCell>

            <TableCell>
              {paket.is_best_seller ? (
                <Badge variant="outline" icon={HeartIcon}>
                  Best Seller
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </TableCell>

            <TableCell className="text-muted-foreground whitespace-nowrap">
              {paket.created_at
                ? format(new Date(paket.created_at), "dd MMM yyyy")
                : "—"}
            </TableCell>

            <TableCell>
              <RowActions
                onEdit={() => onEdit(paket)}
                onDelete={() => onDelete(paket)}
                deleteDisabled={paket.pesanan_count > 0}
                deleteHint={
                  paket.pesanan_count > 0
                    ? "Paket masih memiliki pesanan terkait"
                    : undefined
                }
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
