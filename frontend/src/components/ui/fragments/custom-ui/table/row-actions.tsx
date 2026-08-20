"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete01Icon,
  Edit01Icon,
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
  editDisabled?: boolean
  deleteDisabled?: boolean
  editLabel?: string
  deleteLabel?: string
  deleteHint?: string
}

/** Row-level actions (edit/delete) for admin tables — generic, ready to reuse. */
export function RowActions({
  onEdit,
  onDelete,
  editDisabled = false,
  deleteDisabled = false,
  editLabel = "Ubah",
  deleteLabel = "Hapus",
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
      <DropdownMenuContent align="end" className="w-44">
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
