"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/fragments/shadcn-ui/dialog"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  isPending?: boolean
  onConfirm: () => void
}

/**
 * Generic confirmation dialog for destructive actions (delete). Decoupled from
 * any entity so /dashboard/galeri and /dashboard/pesanan reuse it as-is.
 */
export function DeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Hapus",
  isPending = false,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="w-fit"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            className="w-fit"
          >
            {isPending && <Spinner className="mr-2 size-4" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
