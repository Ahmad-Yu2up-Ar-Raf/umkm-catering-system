"use client"

import { DeleteDialog } from "@/components/ui/fragments/custom-ui/dialog/delete-dialog"
import type { Pesanan } from "../types/pesanan-types"

interface PesananDeleteDialogProps {
  pesanan: Pesanan | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  onConfirm: () => void
}

export function PesananDeleteDialog({
  pesanan,
  open,
  onOpenChange,
  isPending,
  onConfirm,
}: PesananDeleteDialogProps) {
  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Hapus Pesanan Ini?"
      description={
        `Pesanan ${pesanan?.nomor_struk} untuk ${pesanan?.nama_pemesan} akan dihapus permanen. Struk menjadi tidak dapat diambil kembali.`
      }
      confirmLabel="Ya, Hapus"
      isPending={isPending}
      onConfirm={onConfirm}
    />
  )
}