"use client"

import { DeleteDialog } from "@/components/ui/fragments/custom-ui/dialog/delete-dialog"
import type { Testimoni } from "../types/testimoni-types"

interface TestimoniDeleteDialogProps {
  testimoni: Testimoni | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  onConfirm: () => void
}

/** Testimoni-specific copy around the generic DeleteDialog. */
export function TestimoniDeleteDialog({
  testimoni,
  open,
  onOpenChange,
  isPending,
  onConfirm,
}: TestimoniDeleteDialogProps) {
  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Hapus testimoni dari ${testimoni?.nama ?? "pelanggan"}?`}
      description="Apakah Anda yakin ingin menghapus testimoni ini? Tindakan tidak dapat dibatalkan."
      isPending={isPending}
      onConfirm={onConfirm}
    />
  )
}
