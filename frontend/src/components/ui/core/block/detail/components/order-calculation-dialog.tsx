"use client"

import { useEffect, useState } from "react"

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
import { Separator } from "@/components/ui/fragments/shadcn-ui/separator"

import type { DetailViewModel } from "../utils/detail-view-model"
import { OrderForm } from "./order-form"
import { NavbarLogo } from "../../../layout/nav/app-logo"
import Logo from "@/components/svg/app-logo-svg"

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
 * Desktop (≥ lg): centered Shadcn `Dialog` (dark ink overlay, `rounded-4xl`
 * cream surface — the project's dialog grammar).
 * Mobile (< lg): bottom `Drawer` (vaul) — fully swipeable to close.
 *
 * Both surfaces share ONE `OrderForm` instance (same TanStack form state,
 * summary panel, live calculation). Each shell owns the scroll container
 * (`data-lenis-prevent` + `overscroll-contain`) so the underlying page never
 * scrolls while the modal/drawer is open.
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

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-4xl gap-0 overflow-hidden p-0 sm:max-w-[69em]"
          showCloseButton
          data-lenis-prevent
        >
          <DialogHeader className="flex border-b  pb-8 flex-row items-center gap-3 px-6 pt-6  md:px-10 md:pt-10">
            <Logo className="size-10 lg:size-14" />
            <div className="flex flex-col gap-1">
              <DialogTitle className="font-heading text-3xl">
                Pesan{" "}
                <span className="font-accent text-primary italic">Paket</span>
              </DialogTitle>
              <DialogDescription>
                Lengkapi detail pesanan — estimasi dihitung otomatis.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="max-h-[70svh] overflow-y-auto overscroll-contain p-6 pt-0 md:p-10 md:py-8">
            <OrderForm vm={vm} onSuccess={() => onOpenChange(false)} />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent data-lenis-prevent>
        <DrawerHeader className="px-2 pt-2">
          <DrawerTitle className="font-heading text-2xl">{vm.name}</DrawerTitle>
          <DrawerDescription>
            Lengkapi detail pesanan — estimasi dihitung otomatis.
          </DrawerDescription>
        </DrawerHeader>
        <Separator className="mx-6 mb-5" />

        <div className="max-h-[65svh] overflow-y-auto overscroll-contain px-5 pb-8">
          <OrderForm vm={vm} onSuccess={() => onOpenChange(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
