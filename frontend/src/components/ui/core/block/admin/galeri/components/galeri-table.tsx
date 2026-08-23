"use client"

import { useState } from "react"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  EyeIcon,
  HeartIcon,
  Image01Icon,
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
import { useGaleriDeleteMutation } from "../hooks/use-galeri-mutations"
import { useImageModalStore } from "@/store/image-modal-store"
import type { Galeri } from "../types/galeri-types"
import { cn } from "@/lib/utils"

interface GaleriTableProps {
  items: Galeri[]
  onEdit: (galeri: Galeri) => void
  onDelete: (galeri: Galeri) => void
  sortBy?: string
  sortDir?: "asc" | "desc"
  onSortChange?: (column: string, dir: "asc" | "desc") => void
}

const CATEGORY_ICONS: Record<string, typeof Image01Icon> = {
  Pernikahan: Image01Icon,
  Korporat: Image01Icon,
  "Tumpeng & Syukuran": Image01Icon,
  Perayaan: Image01Icon,
  Hampers: Image01Icon,
  "Di Balik Dapur": Image01Icon,
  Lainnya: Image01Icon,
}

const CATEGORY_COLORS: Record<string, string> = {
  Pernikahan: "border-rose-200 text-rose-700 bg-rose-50",
  Korporat: "border-blue-200 text-blue-700 bg-blue-50",
  "Tumpeng & Syukuran": "border-amber-200 text-amber-700 bg-amber-50",
  Perayaan: "border-purple-200 text-purple-700 bg-purple-50",
  Hampers: "border-pink-200 text-pink-700 bg-pink-50",
  "Di Balik Dapur": "border-green-200 text-green-700 bg-green-50",
  Lainnya: "border-gray-200 text-gray-700 bg-gray-50",
}

/**
 * Admin galeri list table — transparent, minimalist, sortable headers.
 */
export function GaleriTable({
  items,
  onEdit,
  onDelete,
  sortBy,
  sortDir,
  onSortChange,
}: GaleriTableProps) {
  const { isPending: isDeleting, variables: deleteVariables } =
    useGaleriDeleteMutation()
  const openImageModal = useImageModalStore((s) => s.open)

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

  /** Resolve the best image URL for preview: thumbnail → gambar_acara → images[0] */
  const getPreviewImage = (galeri: Galeri): string | undefined => {
    return galeri.thumbnail ?? galeri.gambar_acara ?? galeri.images?.[0]
  }

  /** Open the global image modal with the galeri's image(s) */
  const handlePreview = (galeri: Galeri) => {
    const previewImage = getPreviewImage(galeri)
    if (!previewImage) return

    // Build scope from all available images for modal navigation
    const scopeImages = [
      previewImage,
      ...(galeri.thumbnail && galeri.thumbnail !== previewImage ? [galeri.thumbnail] : []),
      ...(galeri.gambar_acara && galeri.gambar_acara !== previewImage ? [galeri.gambar_acara] : []),
      ...galeri.images.filter((img) => img !== previewImage && img !== galeri.thumbnail && img !== galeri.gambar_acara),
    ]

    openImageModal(
      scopeImages.map((src, _idx) => ({
        src,
        title: galeri.nama_acara,
        caption: galeri.deskripsi_acara ?? undefined,
        category: galeri.kategori_acara,
      })),
      0 // start at the primary preview image
    )
  }

  return (
    <Table className="relative bg-transparent">
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          {!hiddenCols.nama_acara && (
            <TableHead className="min-w-64">
              {renderSortHeader("Acara", "nama_acara")}
            </TableHead>
          )}
          {!hiddenCols.kategori_acara && (
            <TableHead className="min-w-36">
              {renderSortHeader("Kategori", "kategori_acara")}
            </TableHead>
          )}
          {!hiddenCols.tanggal_acara && (
            <TableHead className="min-w-32">
              {renderSortHeader("Tanggal", "tanggal_acara")}
            </TableHead>
          )}
          {!hiddenCols.lokasi && (
            <TableHead className="min-w-32">
              {renderSortHeader("Lokasi", "lokasi")}
            </TableHead>
          )}
          {!hiddenCols.jumlah_tamu && (
            <TableHead className="min-w-24">
              {renderSortHeader("Tamu", "jumlah_tamu")}
            </TableHead>
          )}
          {!hiddenCols.is_featured && (
            <TableHead className="min-w-24">
              {renderSortHeader("Unggulan", "is_featured")}
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
        {items.map((galeri) => {
          const isThisDeleting = isDeleting && deleteVariables?.id === galeri.id
          const CategoryIcon = CATEGORY_ICONS[galeri.kategori_acara] || Image01Icon
          const categoryColor = CATEGORY_COLORS[galeri.kategori_acara] || CATEGORY_COLORS.Lainnya
          const previewImage = getPreviewImage(galeri)

          return (
            <TableRow
              key={galeri.id}
              className="group border-border transition-colors hover:bg-muted/40"
            >
              {!hiddenCols.nama_acara && (
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 shrink-0 rounded-full border border-border bg-muted/40">
                      {previewImage ? (
                        <MediaItem
                          webViewLink={previewImage}
                          alt={galeri.nama_acara}
                          layout="constrained"
                          width={80}
                          height={80}
                          className="size-full rounded-xl"
                        />
                      ) : (
                        <AvatarFallback className="rounded-xl text-muted-foreground">
                          <HugeiconsIcon icon={Image01Icon} className="size-5" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {galeri.nama_acara}
                      </p>
                      {galeri.lokasi && (
                        <p className="truncate text-xs text-muted-foreground">
                          {galeri.lokasi}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
              )}

              {!hiddenCols.kategori_acara && (
                <TableCell>
                  <Badge
                    icon={CategoryIcon}
                    variant="outline"
                    className={cn(
                      "w-fit gap-1.5 border-0 text-xs text-accent-foreground shadow-none",
                      categoryColor
                    )}
                  >
                    <span className="font-medium">{galeri.kategori_acara}</span>
                  </Badge>
                </TableCell>
              )}

              {!hiddenCols.tanggal_acara && (
                <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                  {galeri.tanggal_acara
                    ? format(new Date(galeri.tanggal_acara), "dd MMM yyyy")
                    : "—"}
                </TableCell>
              )}

              {!hiddenCols.lokasi && (
                <TableCell className="truncate text-xs text-muted-foreground max-w-[150px]">
                  {galeri.lokasi ?? "—"}
                </TableCell>
              )}

              {!hiddenCols.jumlah_tamu && (
                <TableCell className="text-center text-sm text-muted-foreground">
                  {galeri.jumlah_tamu != null ? `${galeri.jumlah_tamu} tamu` : "—"}
                </TableCell>
              )}

              {!hiddenCols.is_featured && (
                <TableCell>
                  {galeri.is_featured ? (
                    <Badge
                      variant="outline"
                      icon={HeartIcon}
                      className="border-amber-500 bg-amber-500/10 text-xs text-amber-700 [&_svg]:fill-amber-500 [&_svg]:text-amber-500"
                    >
                      Unggulan
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}

              {!hiddenCols.created_at && (
                <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                  {galeri.created_at
                    ? format(new Date(galeri.created_at), "dd MMM yyyy")
                    : "—"}
                </TableCell>
              )}

              <TableCell className="text-right">
                <RowActions
                  onEdit={() => onEdit(galeri)}
                  onDelete={() => onDelete(galeri)}
                  onPreview={() => handlePreview(galeri)}
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