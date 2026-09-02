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
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/fragments/shadcn-ui/avatar"
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
  const { isPending: isDeleting, variables: deleteVariables } =
    usePaketDeleteMutation()

  // Column visibility state
  const [hiddenCols, setHiddenCols] = useState<Record<string, boolean>>({})

  const toggleColumn = (col: string) => {
    setHiddenCols((prev) => ({ ...prev, [col]: !prev[col] }))
  }

  const renderSortHeader = (title: string, columnKey: string) => {
    const isSorted = sortBy === columnKey

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "-ml-3 h-auto gap-2 px-3 text-left text-sm hover:bg-muted/50",
              isSorted && "font-semibold text-foreground"
            )}
          >
            <span className="flex-1">{title}</span>
            <HugeiconsIcon
              icon={
                isSorted
                  ? sortDir === "asc"
                    ? ArrowUp01Icon
                    : ArrowDown01Icon
                  : Sorting01Icon
              }
              className={cn(
                "size-3.5 shrink-0 transition-opacity",
                isSorted
                  ? "text-foreground"
                  : "text-muted-foreground opacity-0 group-hover:opacity-100"
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="z-[9999] w-40">
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
    )
  }

  return (
    <Table className="relative bg-transparent">
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          {!hiddenCols.nama_paket && (
            <TableHead className="min-w-64">
              {renderSortHeader("Paket", "nama_paket")}
            </TableHead>
          )}
          {!hiddenCols.kategori_paket && (
            <TableHead className="min-w-36">
              {renderSortHeader("Kategori", "kategori_paket")}
            </TableHead>
          )}
          {!hiddenCols.kategori_acara && (
            <TableHead className="min-w-32">
              {renderSortHeader("Acara", "kategori_acara")}
            </TableHead>
          )}
          {!hiddenCols.harga_per_porsi && (
            <TableHead className="min-w-36">
              {renderSortHeader("Harga / Porsi", "harga_per_porsi")}
            </TableHead>
          )}
          {!hiddenCols.min_order && (
            <TableHead className="min-w-28">
              {renderSortHeader("Min. Order", "min_order")}
            </TableHead>
          )}
          {!hiddenCols.pesanan && (
            <TableHead className="min-w-24">Terjual</TableHead>
          )}
          {!hiddenCols.status && (
            <TableHead className="min-w-28">
              {renderSortHeader("Status", "is_best_seller")}
            </TableHead>
          )}
          {!hiddenCols.created_at && (
            <TableHead className="min-w-32">
              {renderSortHeader("Dibuat", "created_at")}
            </TableHead>
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
                    <Avatar className="size-10 shrink-0 rounded-full border border-border bg-muted/40">
                      {paket.thumbnail ? (
                        <MediaItem
                          webViewLink={paket.thumbnail}
                          alt={paket.nama_paket}
                          layout="constrained"
                          width={80}
                          height={80}
                          className="size-ful rounded-xl"
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
                      "w-fit gap-1.5 border-0 text-xs text-accent-foreground shadow-none",
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
                      <span className="font-medium">
                        {paket.kategori_acara}
                      </span>
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}

              {!hiddenCols.harga_per_porsi && (
                <TableCell className="font-medium whitespace-nowrap tabular-nums">
                  {formatIDR(paket.harga_per_porsi)}
                </TableCell>
              )}

              {!hiddenCols.min_order && (
                <TableCell className="whitespace-nowrap tabular-nums">
                  {paket.min_order} porsi
                </TableCell>
              )}

              {!hiddenCols.pesanan && (
                <TableCell className="text-muted-foreground tabular-nums">
                  {paket.pesanan_count ?? 0}x
                </TableCell>
              )}

              {!hiddenCols.status && (
                <TableCell>
                  {paket.is_best_seller ? (
                    <Badge
                      variant="outline"
                      icon={HeartIcon}
                      className="border-destructive bg-destructive/5 text-xs text-destructive [&_svg]:fill-destructive [&_svg]:text-destructive"
                    >
                      Best Seller
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}

              {!hiddenCols.created_at && (
                <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                  {paket.created_at
                    ? format(new Date(paket.created_at), "dd MMM yyyy")
                    : "—"}
                </TableCell>
              )}

              <TableCell className="text-right sticky  right-2">
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
