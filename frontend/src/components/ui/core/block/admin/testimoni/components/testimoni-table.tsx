"use client"

import { useState } from "react"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  EyeIcon,
  Message01Icon,
  Sorting01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/fragments/shadcn-ui/avatar"
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
import { Checkbox } from "@/components/ui/fragments/shadcn-ui/checkbox"
import { useTestimoniDeleteMutation } from "../hooks/use-testimoni-mutations"
import { TestimoniStatusBadge } from "./testimoni-status-badge"
import type { Testimoni } from "../types/testimoni-types"
import { cn } from "@/lib/utils"

interface TestimoniTableProps {
  items: Testimoni[]
  onEdit: (testimoni: Testimoni) => void
  onDelete: (testimoni: Testimoni) => void
  sortBy?: string
  sortDir?: "asc" | "desc"
  onSortChange?: (column: string, dir: "asc" | "desc") => void
  selectedIds?: number[]
  onToggle?: (id: number) => void
  onToggleAll?: (checked: boolean) => void
}

/**
 * Rating color tiers: low (1–2) red, medium (3) amber, high (4–5) emerald.
 */
function getRatingTierClasses(rating: number): string {
  if (rating <= 2) {
    return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400"
  }
  if (rating === 3) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
  }
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
}

/**
 * Admin testimoni list table — transparent, minimalist, sortable headers.
 */
export function TestimoniTable({
  items,
  onEdit,
  onDelete,
  sortBy,
  sortDir,
  onSortChange,
  selectedIds = [],
  onToggle,
  onToggleAll,
}: TestimoniTableProps) {
  const isAllSelected = items.length > 0 && selectedIds.length === items.length
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < items.length
  const { isPending: isDeleting, variables: deleteVariables } =
    useTestimoniDeleteMutation()

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
          <TableHead className="w-12">
            <Checkbox
              checked={isAllSelected ? true : isIndeterminate ? "indeterminate" : false}
              onCheckedChange={(checked: boolean | "indeterminate") => onToggleAll?.(checked === true)}
              aria-label="Select all"
              className="mx-3 translate-y-0.5"
            />
          </TableHead>
          {!hiddenCols.nama && (
            <TableHead className="min-w-64">
              {renderSortHeader("Nama", "nama")}
            </TableHead>
          )}
          {!hiddenCols.paket && (
            <TableHead className="min-w-36">Paket</TableHead>
          )}
          {!hiddenCols.acara && (
            <TableHead className="min-w-32">
              {renderSortHeader("Acara", "acara")}
            </TableHead>
          )}
          {!hiddenCols.lokasi && (
            <TableHead className="min-w-32">
              {renderSortHeader("Lokasi", "lokasi")}
            </TableHead>
          )}
          {!hiddenCols.tanggal_acara && (
            <TableHead className="min-w-32">
              {renderSortHeader("Tanggal Acara", "tanggal_acara")}
            </TableHead>
          )}
          {!hiddenCols.visibility && (
            <TableHead className="min-w-28">
              {renderSortHeader("Visibilitas", "visibility")}
            </TableHead>
          )}
          {!hiddenCols.rating && (
            <TableHead className="min-w-24">
              {renderSortHeader("Rating", "rating")}
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
        {items.map((testimoni) => {
          const isThisDeleting = isDeleting && deleteVariables?.id === testimoni.id

          return (
            <TableRow
              key={testimoni.id}
              className="group border-border transition-colors hover:bg-muted/40"
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(testimoni.id)}
                  onCheckedChange={() => onToggle?.(testimoni.id)}
                  aria-label="Select row"
                  className="mx-3 translate-y-0.5"
                />
              </TableCell>
              {!hiddenCols.nama && (
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 shrink-0 rounded-full border border-border bg-muted/40">
                      <AvatarFallback className="rounded-full text-muted-foreground">
                        <HugeiconsIcon
                          icon={Message01Icon}
                          className="size-5"
                        />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 max-w-[200px]">
                      <p className="truncate text-sm font-medium text-foreground">
                        {testimoni.nama}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {testimoni.pesanan}
                      </p>
                    </div>
                  </div>
                </TableCell>
              )}

              {!hiddenCols.paket && (
                <TableCell className="max-w-[160px] truncate text-xs text-muted-foreground">
                  {testimoni.paket?.nama_paket ?? "—"}
                </TableCell>
              )}

              {!hiddenCols.acara && (
                <TableCell className="max-w-[140px] truncate text-xs text-muted-foreground">
                  {testimoni.acara}
                </TableCell>
              )}

              {!hiddenCols.lokasi && (
                <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">
                  {testimoni.lokasi}
                </TableCell>
              )}

              {!hiddenCols.tanggal_acara && (
                <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                  {testimoni.tanggal_acara
                    ? format(new Date(testimoni.tanggal_acara), "dd MMM yyyy")
                    : "—"}
                </TableCell>
              )}

              {!hiddenCols.visibility && (
                <TableCell>
                  <TestimoniStatusBadge visibility={testimoni.visibility} />
                </TableCell>
              )}

              {!hiddenCols.rating && (
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                      getRatingTierClasses(testimoni.rating ?? 5)
                    )}
                  >
                    <HugeiconsIcon
                      icon={StarIcon}
                      className="size-3.5 fill-amber-400 text-amber-400"
                    />
                    {testimoni.rating ?? 5}/5
                  </span>
                </TableCell>
              )}

              {!hiddenCols.created_at && (
                <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                  {testimoni.created_at
                    ? format(new Date(testimoni.created_at), "dd MMM yyyy")
                    : "—"}
                </TableCell>
              )}

              <TableCell className="sticky right-2 text-right">
                <RowActions
                  onEdit={() => onEdit(testimoni)}
                  onDelete={() => onDelete(testimoni)}
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
