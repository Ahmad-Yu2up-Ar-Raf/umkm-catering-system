"use client"

import { useState } from "react"
import { useStore } from "@tanstack/react-store"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/fragments/shadcn-ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/fragments/shadcn-ui/drawer"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { DeleteDialog } from "@/components/ui/fragments/custom-ui/dialog/delete-dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import { HugeiconsIcon } from "@hugeicons/react"
import { StarIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { DETAIL_FALLBACK_IMAGE, type DetailViewModel } from "../utils/detail-view-model"
import { useReviewForm } from "../hooks/use-paket-reviews"

import { ReviewForm } from "./review-form"

/**
 * Rich paket preview — left pane (desktop) / top banner (mobile).
 * Card grammar mirrors OrderSummaryPanel: ringed container, 4/3 media,
 * standardized category Badge (same utils as paket-table/paket-card),
 * definition-list facts.
 */
function PaketPreview({ vm }: { vm: DetailViewModel }) {
  const thumbnail = vm.gallery[0] ?? DETAIL_FALLBACK_IMAGE
  const hasSocialProof = (vm.testimoniCount ?? 0) > 0 && vm.ratingAvg != null

  return (
    <div className="flex h-fit min-w-0 flex-col gap-5 rounded-2xl p-5 ring ring-border/80">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        <MediaItem
          webViewLink={thumbnail}
          alt={vm.name}
          layout="fullWidth"
          sizes="40vw"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="space-y-2">
          <Badge
            icon={vm.categoryIcon}
            variant="outline"
            className={cn(
              "w-fit gap-2 border-0 text-accent-foreground shadow-none lg:text-xs [&_svg]:size-4",
              vm.categoryColor,
              "hover:bg-transparent"
            )}
          >
            <span className="font-medium">{vm.categoryLabel}</span>
          </Badge>
          <p className="font-heading text-2xl font-medium tracking-tight text-foreground">
            {vm.name}
          </p>
          {hasSocialProof && (
            <p className="flex items-center gap-1.5 text-sm">
              <HugeiconsIcon
                icon={StarIcon}
                className="size-4 fill-amber-400 text-amber-400"
              />
              <span className="font-semibold text-foreground tabular-nums">
                {vm.ratingAvg?.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                · {vm.testimoniCount} ulasan
              </span>
            </p>
          )}
        </div>

        <dl className="flex flex-col gap-3">
          {vm.hasPrice && (
            <div className="flex justify-between gap-3">
              <dt className="text-xs tracking-widest text-muted-foreground uppercase">
                Harga dasar
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {vm.priceLabel} / porsi
              </dd>
            </div>
          )}
          {vm.minOrderLabel && (
            <div className="flex justify-between gap-3">
              <dt className="text-xs tracking-widest text-muted-foreground uppercase">
                Min. order
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {vm.minOrderLabel}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}

/**
 * Add-review shell — Dialog on desktop (≥md), Drawer on mobile.
 * Split-pane on desktop (preview | form, mirroring OrderCalculationDialog);
 * stacked on mobile. The form instance is owned HERE so dirty closes route
 * into a discard confirmation (admin/order drawer behavior).
 * Scrollable viewport is Lenis-isolated.
 */
export function AddReviewDialog({
  paketId,
  vm,
  open,
  onOpenChange,
}: {
  paketId: number
  vm: DetailViewModel
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const form = useReviewForm({
    paketId,
    onSuccessCallback: () => {
      form.reset()
      onOpenChange(false)
    },
  })

  const isDirty = useStore(form.store, (s) => s.isDirty)

  const requestClose = () => {
    if (isDirty) {
      setConfirmDiscard(true)
      return
    }
    onOpenChange(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (next) {
      onOpenChange(true)
      return
    }
    requestClose()
  }

  const confirmDiscardAction = () => {
    form.reset()
    setConfirmDiscard(false)
    onOpenChange(false)
  }

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent
            data-lenis-prevent
            className="flex max-h-[92svh] flex-col overflow-hidden"
          >
            <DrawerHeader className="shrink-0 border-b p-4 text-left">
              <DrawerTitle className="font-heading text-xl">
                Tulis <span className="font-accent text-primary italic">Ulasan</span>
              </DrawerTitle>
              <DrawerDescription>
                Bagikan pengalaman Anda dengan paket ini.
              </DrawerDescription>
            </DrawerHeader>
            <div className="show-scrollbar flex-1 overflow-y-auto overscroll-contain px-4 py-6">
              <div className="flex flex-col gap-8">
                <PaketPreview vm={vm} />
                <ReviewForm form={form} onCancel={requestClose} />
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <DeleteDialog
          open={confirmDiscard}
          onOpenChange={setConfirmDiscard}
          title="Buang ulasan?"
          description="Ulasan yang belum dikirim akan hilang. Lanjutkan?"
          confirmLabel="Buang"
          onConfirm={confirmDiscardAction}
        />
      </>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          data-lenis-prevent
          className="flex max-h-[90vh] w-full max-w-5xl flex-col gap-0 overflow-hidden p-0 lg:max-w-[80em]"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>
              Tulis Ulasan untuk {vm.name}
            </DialogTitle>
            <DialogDescription>
              Bagikan pengalaman Anda dengan paket ini.
            </DialogDescription>
          </DialogHeader>
          <div className="show-scrollbar flex-1 overflow-y-auto overscroll-contain">
            <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <aside className="min-w-0 self-start lg:sticky lg:top-4">
                <PaketPreview vm={vm} />
              </aside>
              <div className="flex min-w-0 flex-col gap-8">
                <div className="flex flex-col gap-2 border-b pb-6">
                  <h3 className="font-heading text-3xl">
                    Tulis <span className="font-accent text-primary italic">Ulasan</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Bagikan pengalaman Anda. Ulasan tampil setelah disetujui
                    admin.
                  </p>
                </div>
                <ReviewForm form={form} onCancel={requestClose} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Buang ulasan?"
        description="Ulasan yang belum dikirim akan hilang. Lanjutkan?"
        confirmLabel="Buang"
        onConfirm={confirmDiscardAction}
      />
    </>
  )
}
