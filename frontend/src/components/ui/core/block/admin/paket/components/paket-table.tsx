"use client"

import { useState } from "react"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  EyeIcon,
  HeartIcon,
  PlateIcon,
  Sorting01Icon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback } from "@/components/ui/fragments/shadcn-ui/avatar"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/fragments/shadcn-ui/dropdown-menu"
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
import { usePaketDeleteMutation } from "../hooks/use-paket-mutations"
import { formatIDR } from "../utils/paket-format"
import {
  getCategoryColor,
  getCategoryIcon,
  getAcaraColor,
  getAcaraIcon,
} from "../../../paket/utils/paket-kategori-utils.ts"
import type { Paket } from "../../../paket/types/paket-types"
import { cn } from "@/lib/utils"

interface PaketTableProps {
  items: Paket[]
  onEdit: (paket: Paket) => void
  onDelete: (paket: Paket) => void
  sortBy?: string
  sortDir?: "asc" | "desc"
  onSortChange?: (column: string, dir: "asc" | "desc") => void
}

/**
 * Admin paket list table — transparent, minimalist, sortable headers.
 */
export function PaketTable({
  items,
  onEdit,
  onDelete,
  sortBy,
  sortDir,
  onSortChange,
}: PaketTableProps) {
  const { isPending: isDeleting, variables: deleteVariables } = usePaketDeleteMutation()

  // Column visibility state
  const [hiddenCols, setHiddenCols] = useState<Record<string, boolean>>({})

  const toggleColumn = (col: string) => {
    setHiddenCols((prev) => ({ ...prev, [col]: !prev[col] }))
  }

  const renderSortHeader = (title: string, columnKey: string) => {
    const isSorted = sortBy === columnKey

    return (
      <div className="flex items-center justify-between gap-1">
        <span>{title}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className={cn("h-6 w-6 text-muted-foreground", isSorted && "text-foreground font-semibold")}
            >
              {isSorted ? (
                sortDir === "asc" ? (
                  <HugeiconsIcon icon={ArrowUp01Icon} className="size-3" />
                ) : (
                  <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
                )
              ) : (
                <HugeiconsIcon icon={Sorting01Icon} className="size-3" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40 z-[9999]">
            <DropdownMenuItem onClick={() => onSortChange?.(columnKey, "asc")}>
              <HugeiconsIcon icon={ArrowUp01Icon} className="size-3.5" />
              Sort Ascending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange?.(columnKey, "desc")}>
              <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
              Sort Descending
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toggleColumn(columnKey)}>
              <HugeiconsIcon icon={EyeIcon} className="size-3.5" />
              Sembunyikan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <Table className="bg-transparent">
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          {!hiddenCols.nama_paket && (
            <TableHead className="min-w-64">{renderSortHeader("Paket", "nama_paket")}</TableHead>
          )}
          {!hiddenCols.kategori_paket && (
            <TableHead className="min-w-36">{renderSortHeader("Kategori", "kategori_paket")}</TableHead>
          )}
          {!hiddenCols.kategori_acara && (
            <TableHead className="min-w-32">Acara</TableHead>
          )}
          {!hiddenCols.harga_per_porsi && (
            <TableHead className="min-w-36">{renderSortHeader("Harga / Porsi", "harga_per_porsi")}</TableHead>
          )}
          {!hiddenCols.min_order && (
            <TableHead className="min-w-28">{renderSortHeader("Min. Order", "min_order")}</TableHead>
          )}
          {!hiddenCols.pesanan && (
            <TableHead className="min-w-24">Terjual</TableHead>
          )}
          {!hiddenCols.status && (
            <TableHead className="min-w-28">Status</TableHead>
          )}
          {!hiddenCols.created_at && (
            <TableHead className="min-w-32">{renderSortHeader("Dibuat", "created_at")}</TableHead>
          )}
          <TableHead className="w-12 text-right">
            <span className="sr-only">Aksi</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((paket) => {
          const isThisDeleting = isDeleting && deleteVariables?.id === paket.id
          const categoryIcon = getCategoryIcon(paket.kategori_paket)
          const categoryColor = getCategoryColor(paket.kategori_paket)

          return (
            <TableRow
              key={paket.id}
              className="group border-border transition-colors hover:bg-muted/40"
            >
              {!hiddenCols.nama_paket && (
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
                        {paket.jenis_kemasan || "Standar"}
                      </p>
                    </div>
                  </div>
                </TableCell>
              )}

              {!hiddenCols.kategori_paket && (
                <TableCell>
                  <Badge
                    icon={categoryIcon}
                    variant="outline"
                    className={cn(
                      "w-fit gap-1.5 border-0 text-accent-foreground shadow-none text-xs",
                      categoryColor
                    )}
                  >
                    <span className="font-medium">{paket.kategori_paket}</span>
                  </Badge>
                </TableCell>
              )}

              {!hiddenCols.kategori_acara && (
                <TableCell>
                  {paket.kategori_acara ? (
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
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}

              {!hiddenCols.harga_per_porsi && (
                <TableCell className="font-medium tabular-nums whitespace-nowrap">
                  {formatIDR(paket.harga_per_porsi)}
                </TableCell>
              )}

              {!hiddenCols.min_order && (
                <TableCell className="tabular-nums whitespace-nowrap">
                  {paket.min_order} porsi
                </TableCell>
              )}

              {!hiddenCols.pesanan && (
                <TableCell className="tabular-nums text-muted-foreground">
                  {paket.pesanan_count ?? 0}x
                </TableCell>
              )}

              {!hiddenCols.status && (
                <TableCell>
                  {paket.is_best_seller ? (
                    <Badge
                      variant="outline"
                      icon={HeartIcon}
                      className="border-destructive bg-destructive/5 text-destructive text-xs [&_svg]:fill-destructive [&_svg]:text-destructive"
                    >
                      Best Seller
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}

              {!hiddenCols.created_at && (
                <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                  {paket.created_at
                    ? format(new Date(paket.created_at), "dd MMM yyyy")
                    : "—"}
                </TableCell>
              )}

              <TableCell className="text-right">
                <RowActions
                  onEdit={() => onEdit(paket)}
                  onDelete={() => onDelete(paket)}
                  onPreview={() => window.open(`/paket/${paket.id}`, "_blank")}
                  deleteDisabled={paket.pesanan_count > 0 || isThisDeleting}
                  deleteHint={
                    paket.pesanan_count > 0
                      ? "Paket masih memiliki pesanan terkait"
                      : undefined
                  }
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
