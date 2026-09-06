"use client"

import { useEffect, useRef, useState } from "react"
import { useStore } from "@tanstack/react-store"

import type { OrderFormApi } from "./order-form"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/fragments/shadcn-ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/fragments/shadcn-ui/drawer"
import { Separator } from "@/components/ui/fragments/shadcn-ui/separator"
import { DeleteDialog } from "@/components/ui/fragments/custom-ui/dialog/delete-dialog"

import type { DetailViewModel } from "../utils/detail-view-model"
import { OrderForm, useOrderForm } from "./order-form"

/** lg breakpoint — desktop Dialog vs mobile Drawer switch. */
const DESKTOP_QUERY = "(min-width: 1024px)"

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches
  )

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const onChange = () => setIsDesktop(mql.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isDesktop
}

/**
 * OrderCalculationDialog — responsive shell for the order & calculation form.
 *
 * Owns the form instance (via `useOrderForm`) so it can guard closes: a DIRTY
 * draft routes every close request (outside click, Escape, X button) into a
 * `DeleteDialog` confirmation; a clean draft closes immediately.
 */
export function OrderCalculationDialog({
  open,
  onOpenChange,
  vm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  vm: DetailViewModel
}) {
  const isDesktop = useIsDesktop()
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  // Post-submit success handler — form ownership lives HERE so shell can reset
  const formRef = useRef<OrderFormApi | null>(null)
  const handleSuccess = () => {
    // formRef is synced via effect below; fallback to direct form if available
    if (formRef.current) formRef.current.reset()
    onOpenChange(false)
  }

  // Form ownership lives HERE (same pattern as usePaketForm + CreatePaketDrawer)
  // so the shell can read dirty state and reset on discard/success.
  const form = useOrderForm(vm, handleSuccess)

  useEffect(() => {
    formRef.current = form
  }, [form])

  // Built-in TanStack dirty flag — true when values deviate from defaults.
  const isDirty = useStore(form.store, (s) => s.isDirty)

  /** Every close request funnels through here (outside click, Esc, X). */
  const requestClose = () => {
    if (!isDirty) {
      onOpenChange(false)
      return
    }
    setConfirmDiscard(true)
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

  if (isDesktop) {
    return (
      <>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent
            className="h-full max-h-[90svh] max-w-4xl gap-0 overflow-hidden p-0 sm:max-w-[70em]"
            showCloseButton
            data-lenis-prevent
          >
            <div className="show-scrollbar h-full overflow-y-auto overscroll-contain p-6 pt-0 md:p-9">
              <OrderForm vm={vm} form={form} />
            </div>
          </DialogContent>
        </Dialog>

        <DeleteDialog
          open={confirmDiscard}
          onOpenChange={setConfirmDiscard}
          title="Buang perubahan pesanan?"
          description="Data yang sudah diisi akan hilang jika ditutup sekarang."
          confirmLabel="Buang"
          onConfirm={confirmDiscardAction}
        />
      </>
    )
  }

  return (
    <>
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent data-lenis-prevent>
          <DrawerHeader className="px-2 pt-2">
            <DrawerTitle className="font-heading text-2xl">{vm.name}</DrawerTitle>
            <DrawerDescription>
              Lengkapi detail pesanan — estimasi dihitung otomatis.
            </DrawerDescription>
          </DrawerHeader>
          <Separator className="mx-6 mb-5" />

          <div className="max-h-[65svh] overflow-y-auto overscroll-contain px-5 pb-8">
            <OrderForm vm={vm} form={form} />
          </div>
        </DrawerContent>
      </Drawer>

      <DeleteDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Buang perubahan pesanan?"
        description="Data yang sudah diisi akan hilang jika ditutup sekarang."
        confirmLabel="Buang"
        onConfirm={confirmDiscardAction}
      />
    </>
  )
}
