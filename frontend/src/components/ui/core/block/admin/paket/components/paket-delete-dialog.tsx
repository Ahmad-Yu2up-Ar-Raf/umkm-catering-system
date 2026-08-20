"use client"

import { DeleteDialog } from "@/components/ui/fragments/custom-ui/dialog/delete-dialog"
import type { Paket } from "../../../paket/types/paket-types"

interface PaketDeleteDialogProps {
  paket: Paket | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  onConfirm: () => void
}

/** Paket-specific copy around the generic DeleteDialog. */
export function PaketDeleteDialog({
  paket,
  open,
  onOpenChange,
  isPending,
  onConfirm,
}: PaketDeleteDialogProps) {
  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Hapus ${paket?.nama_paket ?? "paket"}?`}
      description="Apakah Anda yakin ingin menghapus paket ini? Tindakan tidak dapat dibatalkan."
      isPending={isPending}
      onConfirm={onConfirm}
    />
  )
}
