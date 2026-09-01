"use client"

import type { ReactNode } from "react"
import { useStore } from "@tanstack/react-store"
import { useMemo, useEffect, useRef, useState } from "react"
import { Search01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { FieldGroup } from "@/components/ui/fragments/shadcn-ui/field"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Input } from "@/components/ui/fragments/shadcn-ui/input"
import { ScrollArea } from "@/components/ui/fragments/shadcn-ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/fragments/shadcn-ui/collapsible"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
import { PesananCalcPanel } from "./pesanan-calc-panel"
import { usePaketSearch } from "../hooks/use-paket-search"
import { usePaketDetail } from "../hooks/use-paket-detail"
import type { PesananFormReturnType } from "../hooks/use-pesanan-form"
import type { PesananCreateFormValues } from "../schemas/pesanan-schema"
import type { PaketSearchOption } from "../types/pesanan-types"
import {
  STATUS_LABELS,
  PESANAN_STATUSES,
  METODE_PEMBAYARAN,
  METODE_PEMBAYARAN_LABELS,
} from "../types/pesanan-types"
import type { Paket } from "../../../paket/types/paket-types"

const STATUS_SELECT_OPTIONS = PESANAN_STATUSES.map((v) => ({
  value: v,
  label: STATUS_LABELS[v],
}))

const METODE_PEMBAYARAN_OPTIONS = METODE_PEMBAYARAN.map((v) => ({
  value: v,
  label: METODE_PEMBAYARAN_LABELS[v],
}))

interface PesananFormProps {
  form: PesananFormReturnType & {
    store: { state: { values: PesananCreateFormValues } }
  }
  children?: ReactNode
  initialPaket?: PaketSearchOption | null
}

export function PesananForm({
  form,
  children,
  initialPaket,
}: PesananFormProps) {
  const paketId = useStore(form.store, (s) => s.values.paket_id) as
    number | null

  const { data: paketOptions, isLoading: isPaketLoading } = usePaketSearch("")

  const {
    data: paketDetail,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
  } = usePaketDetail(paketId)

  const [paketOpen, setPaketOpen] = useState(false)
  const [paketSearch, setPaketSearch] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [selectedPaketData, setSelectedPaketData] =
    useState<PaketSearchOption | null>(null)

  useEffect(() => {
    if (paketOpen) {
      const t = window.setTimeout(() => searchInputRef.current?.focus(), 50)
      return () => window.clearTimeout(t)
    } else {
      setPaketSearch("")
    }
  }, [paketOpen])

  const mergedPaketOptions = useMemo(() => {
    const baseOptions = paketOptions ?? []
    if (!initialPaket) return baseOptions
    const exists = baseOptions.some((p) => p.id === initialPaket.id)
    if (exists) return baseOptions
    return [initialPaket, ...baseOptions]
  }, [paketOptions, initialPaket])

  const filteredPaketOptions = useMemo(() => {
    if (!paketSearch.trim()) return mergedPaketOptions
    const q = paketSearch.toLowerCase()
    return mergedPaketOptions.filter((p) =>
      p.nama_paket.toLowerCase().includes(q)
    )
  }, [mergedPaketOptions, paketSearch])

  const selectedPaketLabel = useMemo(
    () => mergedPaketOptions.find((p) => p.id === paketId)?.nama_paket ?? null,
    [mergedPaketOptions, paketId]
  )

  const selectedPaketFallback = useMemo(() => {
    if (!paketId) return null
    const fromSearch = mergedPaketOptions?.find((p) => p.id === paketId)
    if (fromSearch) return fromSearch
    if (initialPaket && initialPaket.id === paketId) return initialPaket
    return null
  }, [paketId, mergedPaketOptions, initialPaket])

  const calcPaket = paketDetail
    ? paketDetail
    : (selectedPaketFallback ?? selectedPaketData)

  const isCalcLoading = !!paketId && isDetailLoading

  const menuOptions = useMemo(
    () => (paketDetail?.menu_tambahan ?? []) as string[],
    [paketDetail?.menu_tambahan]
  )
  const hasMenuOptions = menuOptions.length > 0
  const isMenuLoading = !!paketId && (isDetailLoading || isDetailFetching)

  const prevPaketIdRef = useRef<number | null>(paketId)
  useEffect(() => {
    if (prevPaketIdRef.current !== paketId) {
      prevPaketIdRef.current = paketId
      const current = (form.store.state.values as PesananCreateFormValues)
        .menu_tambahan
      if (current && current.length > 0) {
        ;(
          form as unknown as { setFieldValue: (k: string, v: unknown) => void }
        ).setFieldValue?.("menu_tambahan", [])
        try {
          form.setFieldValue("menu_tambahan" as never, [] as never)
        } catch {
          // ignore
        }
      }
    }
  }, [paketId, form])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex flex-1 flex-col overflow-hidden"
    >
      <main className="show-scrollbar flex-1 overflow-y-auto overscroll-contain">
        <div className="grid grid-cols-1 items-start gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
          <div className="flex flex-col gap-12">
            <section>
              <header className="mb-10">
                <h2 className="font-heading text-xl font-semibold">
                  Informasi Wajib Diisi
                </h2>
                <p className="text-sm text-muted-foreground">
                  Data wajib untuk pesanan ini — paket, pemesan, dan jadwal
                  acara.
                </p>
              </header>
              <FieldGroup className="flex flex-col gap-8">
                <form.AppField name="paket_id">
                  {(field) => {
                    const hasError =
                      (field.state.meta.errors?.length ?? 0) > 0 &&
                      (field.form.state.submissionAttempts ?? 0) > 0
                    return (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Paket <span className="text-destructive">*</span>
                        </span>
                        <Collapsible
                          open={paketOpen}
                          onOpenChange={setPaketOpen}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="outline"
                              type="button"
                              disabled={
                                isPaketLoading || field.form.state.isSubmitting
                              }
                              className="flex h-12 w-full items-center justify-between rounded-2xl border border-border/40 bg-transparent px-4 text-sm font-normal shadow-none hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-primary data-[state=open]:bg-primary/5"
                            >
                              <span
                                className={
                                  selectedPaketLabel
                                    ? "font-medium text-primary"
                                    : "text-muted-foreground"
                                }
                              >
                                {selectedPaketLabel ?? "Pilih paket..."}
                              </span>
                              <span className="flex items-center gap-2">
                                {isPaketLoading ? (
                                  <Spinner className="size-4 shrink-0 text-muted-foreground" />
                                ) : (
                                  <HugeiconsIcon
                                    icon={ArrowDown01Icon}
                                    className="size-4 shrink-0 text-muted-foreground transition-transform data-[state=open]:rotate-180"
                                  />
                                )}
                              </span>
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                            <div className="mt-2 flex flex-col gap-2 rounded-2xl border bg-popover p-2 shadow-2xl ring-1 ring-foreground/5">
                              <Input
                                ref={searchInputRef}
                                value={paketSearch}
                                onChange={(e) => setPaketSearch(e.target.value)}
                                placeholder="Cari paket..."
                                leftIcon={Search01Icon}
                                className="h-9 w-full"
                                autoFocus
                              />
                              <ScrollArea className="h-60 w-full rounded-md border">
                                <div className="flex flex-col p-1">
                                  {filteredPaketOptions.length === 0 ? (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                      {isPaketLoading
                                        ? "Memuat paket..."
                                        : "Pencarian tidak ditemukan."}
                                    </div>
                                  ) : (
                                    filteredPaketOptions.map((pkg) => {
                                      const isSelected = pkg.id === paketId
                                      return (
                                        <div
                                          key={pkg.id}
                                          role="button"
                                          tabIndex={0}
                                          onClick={() => {
                                            setSelectedPaketData(pkg)
                                            ;(
                                              field as unknown as {
                                                handleChange: (
                                                  v: number
                                                ) => void
                                              }
                                            ).handleChange(pkg.id)
                                            try {
                                              form.setFieldValue(
                                                "paket_id" as never,
                                                pkg.id as never
                                              )
                                            } catch {}
                                            setPaketSearch("")
                                            setPaketOpen(false)
                                          }}
                                          onKeyDown={(e) => {
                                            if (
                                              e.key === "Enter" ||
                                              e.key === " "
                                            ) {
                                              e.preventDefault()
                                              setSelectedPaketData(pkg)
                                              ;(
                                                field as unknown as {
                                                  handleChange: (
                                                    v: number
                                                  ) => void
                                                }
                                              ).handleChange(pkg.id)
                                              try {
                                                form.setFieldValue(
                                                  "paket_id" as never,
                                                  pkg.id as never
                                                )
                                              } catch {}
                                              setPaketSearch("")
                                              setPaketOpen(false)
                                            }
                                          }}
                                          className={
                                            "flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground " +
                                            (isSelected
                                              ? "bg-primary/10 font-medium text-primary"
                                              : "")
                                          }
                                        >
                                          <span>{pkg.nama_paket}</span>
                                          {isSelected && (
                                            <span className="text-xs text-primary">
                                              ✓
                                            </span>
                                          )}
                                        </div>
                                      )
                                    })
                                  )}
                                </div>
                              </ScrollArea>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                        {hasError && (
                          <p className="text-xs text-destructive">
                            {String(
                              field.state.meta.errors[0] ??
                                "Pilih paket terlebih dahulu."
                            )}
                          </p>
                        )}
                      </div>
                    )
                  }}
                </form.AppField>

                {paketId !== null && (
                  <div className="flex flex-col gap-2">
                    {isMenuLoading ? (
                      <div className="flex flex-col gap-3">
                        <Skeleton className="h-4 w-32" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Skeleton className="h-14 w-full rounded-2xl" />
                          <Skeleton className="h-14 w-full rounded-2xl" />
                          <Skeleton className="h-14 w-full rounded-2xl" />
                          <Skeleton className="h-14 w-full rounded-2xl" />
                        </div>
                      </div>
                    ) : hasMenuOptions ? (
                      <form.AppField name="menu_tambahan">
                        {(field) => (
                          <field.CheckboxGroup
                            label="Menu Tambahan"
                            subLabel="Opsional — dari paket terpilih"
                            options={menuOptions.map((item) => ({
                              label: item,
                              value: item,
                            }))}
                          />
                        )}
                      </form.AppField>
                    ) : null}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <form.AppField name="nama_pemesan">
                    {(field) => (
                      <field.Input
                        label="Nama Pemesan"
                        placeholder="Contoh: Budi Santoso"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="no_telepon">
                    {(field) => (
                      <field.Input
                        label="No. Telepon"
                        type="tel"
                        placeholder="Contoh: 081234567890"
                      />
                    )}
                  </form.AppField>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <form.AppField name="jumlah_paket">
                    {(field) => (
                      <field.Input
                        label="Jumlah Paket"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        placeholder="Contoh: 10"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="tanggal_acara">
                    {(field) => (
                      <field.DateInput
                        label="Tanggal Acara"
                        placeholder="Pilih tanggal acara"
                      />
                    )}
                  </form.AppField>
                </div>
              </FieldGroup>
            </section>

            <section className="border-t border-border pt-8">
              <header className="mb-10">
                <h2 className="font-heading text-xl font-semibold">
                  Informasi Opsional
                </h2>
                <p className="text-sm text-muted-foreground">
                  Informasi tambahan — status, biaya, alamat, dan catatan.
                </p>
              </header>
              <FieldGroup className="flex flex-col gap-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <form.AppField name="status_pesanan">
                    {(field) => (
                      <field.Select
                        label="Status Pesanan"
                        placeholder="Pilih status (opsional)"
                        options={STATUS_SELECT_OPTIONS}
                        noneLabel="— Tanpa status —"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="biaya_tambahan">
                    {(field) => (
                      <field.CurrencyInput
                        label="Biaya Tambahan"
                        placeholder="Opsional — Rp 0"
                      />
                    )}
                  </form.AppField>
                </div>

                <form.AppField name="metode_pembayaran">
                  {(field) => (
                    <field.RadioGroup
                      label="Metode Pembayaran"
                      options={METODE_PEMBAYARAN_OPTIONS}
                    />
                  )}
                </form.AppField>

                <form.AppField name="alamat">
                  {(field) => (
                    <field.TextArea
                      label="Alamat"
                      placeholder="Opsional — alamat pengiriman / lokasi acara"
                    />
                  )}
                </form.AppField>

                <form.AppField name="detail_tambahan">
                  {(field) => (
                    <field.TagInput
                      label="Detail Tambahan"
                      placeholder="Opsional — tambahan nasi, air mineral (Enter untuk menambah)"
                    />
                  )}
                </form.AppField>

                <form.AppField name="catatan">
                  {(field) => (
                    <field.TextArea
                      label="Catatan"
                      placeholder="Opsional — catatan khusus untuk pesanan ini..."
                    />
                  )}
                </form.AppField>
              </FieldGroup>
            </section>
          </div>

          <aside className="relative">
            <PesananCalcPanel
              form={form}
              paketDetail={calcPaket as Paket | null}
              isLoading={isCalcLoading}
            />
          </aside>
        </div>
      </main>
      {children}
    </form>
  )
}
