"use client"

import { DeleteDialog } from "@/components/ui/fragments/custom-ui/dialog/delete-dialog"
import type { Galeri } from "../types/galeri-types"

interface GaleriDeleteDialogProps {
  galeri: Galeri | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  onConfirm: () => void
}

/** Galeri-specific copy around the generic DeleteDialog. */
export function GaleriDeleteDialog({
  galeri,
  open,
  onOpenChange,
  isPending,
  onConfirm,
}: GaleriDeleteDialogProps) {
  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Hapus ${galeri?.nama_acara ?? "galeri"}?`}
      description="Apakah Anda yakin ingin menghapus galeri ini? Tindakan tidak dapat dibatalkan."
      isPending={isPending}
      onConfirm={onConfirm}
    />
  )
}