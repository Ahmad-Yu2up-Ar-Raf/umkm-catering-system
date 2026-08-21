"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete01Icon,
  Edit01Icon,
  EyeIcon,
  MoreHorizontalIcon,
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
  editDisabled?: boolean
  deleteDisabled?: boolean
  editLabel?: string
  deleteLabel?: string
  previewLabel?: string
  deleteHint?: string
}

/** Row-level actions (edit/delete/preview) for admin tables. */
export function RowActions({
  onEdit,
  onDelete,
  onPreview,
  editDisabled = false,
  deleteDisabled = false,
  editLabel = "Ubah",
  deleteLabel = "Hapus",
  previewLabel = "Lihat Detail",
  deleteHint,
}: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Tindakan baris"
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 z-[9999]">
        {onPreview && (
          <DropdownMenuItem onSelect={onPreview}>
            <HugeiconsIcon icon={EyeIcon} className="size-4" />
            {previewLabel}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={onEdit} disabled={editDisabled}>
          <HugeiconsIcon icon={Edit01Icon} className="size-4" />
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
