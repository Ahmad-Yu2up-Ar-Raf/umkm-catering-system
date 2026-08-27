"use client"

import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  EyeIcon,
  Sorting01Icon,
} from "@hugeicons/core-free-icons"
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
import { RowActions } from "@/components/ui/fragments/custom-ui/table/row-actions"
import { PesananStatusBadge } from "./pesanan-status-badge"
import { formatRupiah } from "../utils/pesanan-calculator"
import { usePesananDeleteMutation } from "../hooks/use-pesanan-mutations"
import type { Pesanan } from "../types/pesanan-types"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface PesananTableProps {
  items: Pesanan[]
  onEdit: (pesanan: Pesanan) => void
  onDelete: (pesanan: Pesanan) => void
  onStruk: (pesanan: Pesanan) => void
  sortBy?: string
  sortDir?: "asc" | "desc"
  onSortChange?: (column: string, dir: "asc" | "desc") => void
}

/**
 * Admin pesanan list table — transparent, minimalist, sortable headers.
 */
export function PesananTable({
  items,
  onEdit,
  onDelete,
  onStruk,
  sortBy,
  sortDir,
  onSortChange,
}: PesananTableProps) {
  const { isPending: isDeleting, variables: deleteVariables } =
    usePesananDeleteMutation()

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
          {!hiddenCols.nomor_struk && (
            <TableHead className="min-w-40">
              {renderSortHeader("Nomor Struk", "nomor_struk")}
            </TableHead>
          )}
          {!hiddenCols.nama_pemesan && (
            <TableHead className="min-w-48">
              {renderSortHeader("Pemesan", "nama_pemesan")}
            </TableHead>
          )}
          {!hiddenCols.paket && (
            <TableHead className="min-w-40">Paket</TableHead>
          )}
          {!hiddenCols.jumlah_paket && (
            <TableHead className="min-w-24">
              {renderSortHeader("Jumlah", "jumlah_paket")}
            </TableHead>
          )}
          {!hiddenCols.total_harga && (
            <TableHead className="min-w-36">
              {renderSortHeader("Total", "total_harga")}
            </TableHead>
          )}
          {!hiddenCols.status_pesanan && (
            <TableHead className="min-w-28">Status</TableHead>
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
        {items.map((pesanan) => {
          const isThisDeleting = isDeleting && deleteVariables?.id === pesanan.id

          return (
            <TableRow
              key={pesanan.id}
              className="group border-border transition-colors hover:bg-muted/40"
            >
              {!hiddenCols.nomor_struk && (
                <TableCell>
                  <code className="text-xs font-mono text-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                    {pesanan.nomor_struk}
                  </code>
                </TableCell>
              )}
              {!hiddenCols.nama_pemesan && (
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {pesanan.nama_pemesan}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {pesanan.no_telepon}
                    </p>
                  </div>
                </TableCell>
              )}
              {!hiddenCols.paket && (
                <TableCell className="text-sm font-medium text-foreground">
                  {pesanan.paket?.nama_paket ?? "—"}
                </TableCell>
              )}
              {!hiddenCols.jumlah_paket && (
                <TableCell className="whitespace-nowrap tabular-nums text-right">
                  {pesanan.jumlah_paket} porsi
                </TableCell>
              )}
              {!hiddenCols.total_harga && (
                <TableCell className="font-medium whitespace-nowrap tabular-nums text-right">
                  {formatRupiah(pesanan.total_harga)}
                </TableCell>
              )}
              {!hiddenCols.status_pesanan && (
                <TableCell>
                  <PesananStatusBadge status={pesanan.status_pesanan} />
                </TableCell>
              )}
              {!hiddenCols.created_at && (
                <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                  {pesanan.created_at
                    ? format(new Date(pesanan.created_at), "dd MMM yyyy")
                    : "—"}
                </TableCell>
              )}
              <TableCell className="text-right">
                <RowActions
                  onEdit={() => onEdit(pesanan)}
                  onDelete={() => onDelete(pesanan)}
                  onPreview={() => onStruk(pesanan)}
                  editLabel="Ubah"
                  deleteLabel="Hapus"
                  previewLabel="Struk"
                  deleteDisabled={isThisDeleting}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}