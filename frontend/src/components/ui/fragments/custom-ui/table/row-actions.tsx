"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Delete01Icon,
  Download01Icon,
  Download02FreeIcons,
  Edit01Icon,
  EyeIcon,
  Invoice,
  InvoiceIcon,
  MoreHorizontalIcon,
  PencilEdit01FreeIcons,
  PencilEdit02FreeIcons,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/fragments/shadcn-ui/dropdown-menu"

interface RowActionsProps {
  onEdit: () => void
  onDelete: () => void
  onPreview?: () => void
  onDownload?: () => void
  editDisabled?: boolean
  deleteDisabled?: boolean
  downloadDisabled?: boolean
  editLabel?: string
  deleteLabel?: string
  previewLabel?: string
  downloadLabel?: string
  previewIcon?: IconSvgElement
  deleteHint?: string
}

/** Row-level actions (edit/delete/preview/download) for admin tables. */
export function RowActions({
  onEdit,
  onDelete,
  onPreview,
  onDownload,
  editDisabled = false,
  deleteDisabled = false,
  downloadDisabled = false,
  editLabel = "Perbarui",
  deleteLabel = "Hapus",
  previewLabel = "Lihat Detail",
  downloadLabel = "Download",
  previewIcon = EyeIcon,
  deleteHint,
}: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Tindakan baris"
          className="opacity-0 transition-opacity group-hover:opacity-100 hover:bg-secondary focus-visible:opacity-100"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[9999] w-44">
        {onPreview && (
          <DropdownMenuItem onSelect={onPreview}>
            <HugeiconsIcon icon={previewIcon} className="size-4 text-primary" />
            {previewLabel}
          </DropdownMenuItem>
        )}
        {onDownload && (
          <DropdownMenuItem onSelect={onDownload} disabled={downloadDisabled}>
            <HugeiconsIcon
              icon={Download02FreeIcons}
              className="size-4 text-primary"
            />
            {downloadLabel}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={onEdit} disabled={editDisabled}>
          <HugeiconsIcon
            icon={PencilEdit01FreeIcons}
            className="size-4 text-primary"
          />
          {editLabel}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onDelete}
          disabled={deleteDisabled}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          title={deleteHint}
        >
          <HugeiconsIcon icon={Delete01Icon} className="size-4" />
          {deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
