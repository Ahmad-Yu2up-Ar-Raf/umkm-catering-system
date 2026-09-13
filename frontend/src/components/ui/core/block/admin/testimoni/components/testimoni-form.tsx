"use client"

import type { ReactNode } from "react"
import { useStore } from "@tanstack/react-store"
import { useMemo, useEffect, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  CalendarIcon,
  EyeIcon,
  EyeOffIcon,
  Location01Icon,
  Message01Icon,
  Search01Icon,
  ShoppingBag01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"
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
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { usePaketSearch } from "../../pesanan/hooks/use-paket-search"
import { usePaketDetail } from "../../pesanan/hooks/use-paket-detail"
import type { TestimoniFormReturnType } from "../hooks/use-testimoni-mutations"
import type { PaketSearchOption } from "../../pesanan/types/pesanan-types"

const VISIBILITY_OPTIONS = [
  {
    value: "public",
    label: "Publik",
    icon: <HugeiconsIcon icon={EyeIcon} className="size-5" />,
  },
  {
    value: "private",
    label: "Privat",
    icon: <HugeiconsIcon icon={EyeOffIcon} className="size-5" />,
  },
]

interface TestimoniFormProps {
  form: TestimoniFormReturnType
  children?: ReactNode
  initialPaket?: PaketSearchOption | null
}

/**
 * Shared Create/Update Testimoni form.
 * Grid layout matching Galeri/Paket: left column (1.2fr) = main form,
 * right column (0.8fr) = sticky paket summary + media sidebar.
 */
export function TestimoniForm({
  form,
  children,
  initialPaket,
}: TestimoniFormProps) {
  const paketId = useStore(form.store, (s) => s.values.paket_id) as
    number | null

  const { data: paketOptions, isLoading: isPaketLoading } = usePaketSearch("")

  const {
    data: paketDetail,
    isLoading: isDetailLoading,
  } = usePaketDetail(paketId)

  const [paketOpen, setPaketOpen] = useState(false)
  const [paketSearch, setPaketSearch] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!paketOpen) return
    const t = window.setTimeout(() => searchInputRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [paketOpen])

  const handlePaketOpenChange = (open: boolean) => {
    if (!open) setPaketSearch("")
    setPaketOpen(open)
  }

  const selectPaket = (
    pkg: PaketSearchOption,
    fieldApi: {
      handleChange: (v: number) => void
      validate?: (cause: "change") => void
    }
  ) => {
    fieldApi.handleChange(pkg.id)
    const formApi = form as unknown as {
      setFieldValue?: (key: string, value: unknown) => void
    }
    formApi.setFieldValue?.("paket_id", pkg.id)
    // Re-run change validation explicitly so a prior submit-phase error
    // clears the instant a valid paket is picked (no blur needed).
    fieldApi.validate?.("change")
    setPaketSearch("")
    setPaketOpen(false)
  }

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

  const isDetailPending = !!paketId && isDetailLoading
  // Guard against stale React Query data: only show the summary when the
  // loaded detail actually matches the currently selected paket (deselecting
  // keeps the last successful payload cached with `enabled: false`).
  const showPaketSummary =
    !!paketId && !isDetailPending && paketDetail?.id === paketId

  const formatRupiah = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return "—"
    const num = typeof value === "string" ? Number(value) : value
    if (!Number.isFinite(num)) return "—"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num)
  }

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
        <div className="grid grid-cols-1 items-start gap-12 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          {/* LEFT COLUMN: Main form fields */}
          <div className="flex flex-col gap-12">
            <section>
              <header className="mb-8 border-b pb-6">
                <h2 className="font-heading text-xl font-semibold">
                  Informasi Dasar
                </h2>
                <p className="text-sm text-muted-foreground">
                  Data wajib untuk testimoni pelanggan ini.
                </p>
              </header>
              <FieldGroup className="flex flex-col gap-8">
                <form.AppField name="nama">
                  {(field) => (
                    <field.Input
                      label="Nama"
                      LeftIcon={Message01Icon}
                      placeholder="Contoh: Ibu Ratna"
                    />
                  )}
                </form.AppField>

                <form.AppField name="pesanan">
                  {(field) => (
                    <field.TextArea
                      label="Pesan"
                      placeholder="Tulis ulasan pelanggan di sini. Contoh: Nasi Box Hemat × 150 — rasanya seperti masakan rumah, tamu sangat puas."
                      rows={4}
                    />
                  )}
                </form.AppField>

                <form.AppField name="paket_id">
                  {(field) => {
                    const hasError =
                      (field.state.meta.errors?.length ?? 0) > 0 &&
                      (field.form.state.submissionAttempts ?? 0) > 0
                    // Zod/Standard-Schema issues arrive as objects
                    // ({ message }), never strings — String() on them
                    // renders "[object Object]".
                    const rawError = field.state.meta.errors[0] as
                      | string
                      | { message?: string }
                      | undefined
                    const errorMessage =
                      typeof rawError === "string"
                        ? rawError
                        : (rawError?.message ?? "Pilih paket terlebih dahulu.")
                    // `disabled` MUST subscribe to isSubmitting reactively:
                    // useField only tracks the field store, so a snapshot
                    // read freezes at its last render — after a failed submit
                    // that freeze left this trigger permanently disabled.
                    // form.Subscribe (same primitive as the submit button)
                    // re-renders on every lifecycle change.
                    return (
                      <form.Subscribe selector={(state) => state.isSubmitting}>
                        {(isSubmitting) => (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Paket <span className="text-destructive">*</span>
                        </span>
                        <Collapsible
                          open={paketOpen}
                          onOpenChange={handlePaketOpenChange}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="outline"
                              type="button"
                              id={field.name}
                              // Subscribed (not snapshot-read): useField only
                              // tracks the field store, so a snapshot read
                              // freezes at its last render — after a failed
                              // submit that freeze left this trigger
                              // permanently disabled.
                              disabled={isSubmitting}
                              aria-invalid={hasError}
                              aria-busy={isPaketLoading}
                              className={
                                "flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-sm font-normal shadow-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-primary data-[state=open]:bg-primary/5 " +
                                (hasError
                                  ? "border-destructive bg-destructive/5 hover:bg-destructive/10"
                                  : "border-border/40 bg-transparent hover:bg-primary/5")
                              }
                            >
                              <span
                                className={
                                  selectedPaketLabel
                                    ? "font-medium text-primary"
                                    : hasError
                                      ? "text-destructive"
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
                                className="h-9 w-full rounded-xl"
                                autoFocus
                              />
                              <ScrollArea className="h-60 w-full rounded-xl border">
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
                                            selectPaket(pkg, field as unknown as {
                                              handleChange: (v: number) => void
                                              validate?: (cause: "change") => void
                                            })
                                          }}
                                          onKeyDown={(e) => {
                                            if (
                                              e.key === "Enter" ||
                                              e.key === " "
                                            ) {
                                              e.preventDefault()
                                              selectPaket(pkg, field as unknown as {
                                                handleChange: (v: number) => void
                                                validate?: (cause: "change") => void
                                              })
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
                          <p role="alert" className="text-xs text-destructive">
                            {errorMessage}
                          </p>
                        )}
                      </div>
                        )}
                      </form.Subscribe>
                    )
                  }}
                </form.AppField>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <form.AppField name="acara">
                    {(field) => (
                      <field.Input
                        label="Acara"
                        LeftIcon={SparklesIcon}
                        placeholder="Contoh: Pernikahan"
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="lokasi">
                    {(field) => (
                      <field.Input
                        label="Lokasi"
                        LeftIcon={Location01Icon}
                        placeholder="Contoh: Taman Sari, Bogor"
                      />
                    )}
                  </form.AppField>
                </div>

                <form.AppField name="tanggal_acara">
                  {(field) => (
                    <field.DateInput
                      label="Tanggal Acara"
                      LeftIcon={CalendarIcon}
                      placeholder="Pilih tanggal (opsional)"
                    />
                  )}
                </form.AppField>

                <form.AppField name="rating">
                  {(field) => (
                    <field.Rating label="Rating Bintang" />
                  )}
                </form.AppField>
              </FieldGroup>
            </section>

            {/* Visibilitas Section */}
            <section className="border-t border-border pt-8">
              <header className="mb-8">
                <h2 className="font-heading text-xl font-semibold">
                  Visibilitas
                </h2>
                <p className="text-sm text-muted-foreground">
                  Tentukan apakah testimoni tampil untuk publik atau
                  disimpan internal.
                </p>
              </header>
              <FieldGroup className="flex flex-col gap-8">
                <form.AppField name="visibility">
                  {(field) => (
                    <field.RadioGroup
                      label="Visibilitas Testimoni"
                      options={VISIBILITY_OPTIONS}
                    />
                  )}
                </form.AppField>
              </FieldGroup>
            </section>
          </div>

          {/* RIGHT COLUMN: Sticky Paket summary sidebar */}
          <aside className="sticky top-4 flex flex-col gap-8 rounded-2xl border p-6 sm:top-10 lg:p-7">
            <header className="flex items-center gap-2 border-b pb-4">
              <div>
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  Paket Terkait
                </h2>
                <p className="text-xs text-muted-foreground">
                  Ringkasan paket yang diulas pelanggan.
                </p>
              </div>
            </header>

            <div className="flex flex-col gap-3">
              {isDetailPending ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="size-14 shrink-0 rounded-xl" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
              ) : showPaketSummary && paketDetail ? (
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3">
                  {paketDetail.thumbnail ? (
                    <MediaItem
                      webViewLink={paketDetail.thumbnail}
                      alt={paketDetail.nama_paket}
                      layout="constrained"
                      width={112}
                      height={112}
                      className="size-14 shrink-0 rounded-xl"
                    />
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <HugeiconsIcon icon={ShoppingBag01Icon} className="size-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {paketDetail.nama_paket}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRupiah(
                        (paketDetail as unknown as { harga_per_porsi?: string | number }).harga_per_porsi
                      )}{" "}
                      / porsi
                    </p>
                  </div>
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  Pilih paket untuk melihat ringkasan di sini.
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
      {children}
    </form>
  )
}
