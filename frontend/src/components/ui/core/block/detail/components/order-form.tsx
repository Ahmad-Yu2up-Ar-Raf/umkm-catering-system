"use client"

import { useMemo } from "react"
import { useStore } from "@tanstack/react-store"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  CalculatorIcon,
  Dish01Icon,
  Location01Icon,
  UserIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"

import { useAppForm } from "@/hooks/use-form"
import { FieldGroup } from "@/components/ui/fragments/shadcn-ui/field"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
import { BUSINESS_NUMBER, getWhatsAppLink } from "@/lib/whatsapp"
import { createOrderSchema } from "../validations/order-schema"
import { buildWaOrderMessage, calculateOrder } from "../utils/order-calculator"
import type { DetailViewModel } from "../utils/detail-view-model"
import { OrderSummaryPanel } from "./order-summary-panel"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/fragments/shadcn-ui/dialog"
/**
 * OrderForm — interactive order & calculation form, shared verbatim by the
 * desktop Dialog and the mobile Drawer shells (`OrderCalculationDialog`).
 *
 * TanStack Form (`useAppForm`) + the Zod schema factory parametrized by the
 * package's runtime capacity. `form.AppForm` (form context provider) wraps
 * BOTH the summary panel (live estimate) and the fields; validators run on
 * submit. Scrolling is owned by the shell, so this component stays surface-
 * agnostic — only the internal rail classes here.
 *
 * Submit: validate → build the structured WA message → open `wa.me` →
 * success toast → close. The estimate is a UX-only preview; the server still
 * owns `total_harga`.
 */
export function OrderForm({
  vm,
  onSuccess,
}: {
  vm: DetailViewModel
  onSuccess: () => void
}) {
  // ONE schema drives every validation phase. TanStack v1 purges a field's
  // submit error whenever a change/blur validation runs WITHOUT an error;
  // giving those phases the real rules keeps genuinely-invalid fields red
  // (their phase errors), while a truly-fixed field clears immediately.
  // Schema for the form's `onSubmit` — `useAppForm` automatically reuses it
  // for onChange/onBlur so invalid fields keep their errors until fixed, and
  // injects the global error toast + first-error auto-focus on failed submit.
  const orderSchema = createOrderSchema({
    capacity: vm.capacity,
    addonOptions: vm.menuExtra ?? [],
  })

  const form = useAppForm({
    validators: {
      onSubmit: orderSchema,
    },
    defaultValues: {
      nama: "",
      lokasi_acara: "",
      tanggal_acara: "",
      jumlah_porsi: vm.minOrder,
      lauk_pelengkap: [] as string[],
      catatan: "",
    },
    onSubmit: async ({ value }) => {
      const calc = calculateOrder({
        jumlahPorsi: value.jumlah_porsi,
        hargaPerPorsi: vm.hargaPerPorsi,
        laukPelengkap: value.lauk_pelengkap,
      })
      const msg = buildWaOrderMessage(value, vm, calc.totalLabel)
      window.open(getWhatsAppLink(BUSINESS_NUMBER, msg), "_blank", "noopener")
      toast.success("Pesanan dikirim ke WhatsApp — admin akan mengonfirmasi")
      onSuccess()
    },
  })

  const values = useStore(form.baseStore, (s) => s.values)
  const isSubmitting = useStore(form.baseStore, (s) => s.isSubmitting)

  const calc = useMemo(
    () =>
      calculateOrder({
        jumlahPorsi: values.jumlah_porsi || 0,
        hargaPerPorsi: vm.hargaPerPorsi,
        laukPelengkap: values.lauk_pelengkap,
      }),
    [values.jumlah_porsi, values.lauk_pelengkap, vm.hargaPerPorsi]
  )

  const hasAddons = (vm.menuExtra?.length ?? 0) > 0

  return (
    <form.AppForm>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <OrderSummaryPanel vm={vm} />

        {/* right rail — the SHELL owns max-height/scroll containment */}
        <div className="pt-0 lg:py-6">
          <DialogHeader className="flex flex-row items-center gap-4 border-b pb-8  mb-8">
            <div className="flex flex-col gap-2">
              <DialogTitle className="font-heading text-3xl">
                Pesan{" "}
                <span className="font-accent text-primary italic">Paket</span>
              </DialogTitle>
              <DialogDescription>
                Lengkapi detail pesanan — estimasi dihitung otomatis.
              </DialogDescription>
            </div>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="flex flex-col gap-8"
          >
            <FieldGroup className="gap-10">
              <form.AppField name="nama">
                {(field) => (
                  <field.Input
                    label="Nama"
                    LeftIcon={UserIcon}
                    placeholder="Contoh: Budi Santoso"
                  />
                )}
              </form.AppField>

              <form.AppField name="lokasi_acara">
                {(field) => (
                  <field.TextArea
                    label="Lokasi"
                    LeftIcon={Location01Icon}
                    placeholder="Contoh: Jl. Merdeka No. 45, Bogor Tengah, Kota Bogor"
                  />
                )}
              </form.AppField>

              <form.AppField name="tanggal_acara">
                {(field) => (
                  <field.DateInput
                    label="Tanggal Acara"
                    LeftIcon={Calendar01Icon}
                    disablePast
                    placeholder="Pilih tanggal acara..."
                  />
                )}
              </form.AppField>

              <form.AppField name="jumlah_porsi">
                {(field) => (
                  <field.Input
                    LeftIcon={CalculatorIcon}
                    label="Jumlah Porsi"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={vm.capacity ?? undefined}
                    placeholder={
                      vm.capacity != null && vm.capacity > 0
                        ? `Min. 1 porsi (maks. ${vm.capacity})`
                        : "Masukkan jumlah porsi..."
                    }
                  />
                )}
              </form.AppField>

              {hasAddons && (
                <form.AppField name="lauk_pelengkap">
                  {(field) => (
                    <field.CheckboxGroup
                      subLabel="Opsional"
                      label="Menu Tambahan"
                      options={(vm.menuExtra ?? []).map((item) => ({
                        label: item,
                        value: item,
                      }))}
                    />
                  )}
                </form.AppField>
              )}

              <form.AppField name="catatan">
                {(field) => (
                  <field.TextArea
                    subLabel="Opsional"
                    label="Catatan"
                    LeftIcon={Dish01Icon}
                    placeholder="Contoh: Mohon dikirim tepat pukul 10.00 WIB, jangan pakai kacang."
                  />
                )}
              </form.AppField>
            </FieldGroup>

            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3 px-2">
                <span className="text-xs tracking-widest text-muted-foreground uppercase">
                  Estimasi
                </span>
                <span className="font-sans text-lg font-semibold text-foreground">
                  {calc.hasPrice ? calc.totalLabel : "—"}
                </span>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-ful cursor-pointer py-6"
              >
                <HugeiconsIcon icon={WhatsappIcon} className="size-5" />
                <span className="font-bold">Kirim ke WhatsApp</span>
                {isSubmitting && (
                  <Spinner className="text-primary-foreground" />
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Belum termasuk biaya tambahan — dikonfirmasi admin via WhatsApp.
              </p>
            </div>
          </form>
        </div>
      </div>
    </form.AppForm>
  )
}
