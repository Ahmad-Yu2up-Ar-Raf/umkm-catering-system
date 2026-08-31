"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/fragments/shadcn-ui/dialog"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import { InvoicePesananDocument } from "./invoice-pesanan-document"
import {
  buildInvoiceRenderOptions,
  loadInvoiceFonts,
} from "./invoice-render-config"
import type { StrukPayload } from "@/components/ui/core/block/admin/pesanan/types/pesanan-types"

interface Props {
  data: StrukPayload | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading?: boolean
  onRefresh?: () => void
}

export function InvoicePreviewDialog({
  data,
  open,
  onOpenChange,
  isLoading = false,
  onRefresh,
}: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const generate = useCallback(async () => {
    if (!data) {
      setError("Data struk belum tersedia.")
      return
    }
    setGenerating(true)
    setError(null)
    // Revoke previous blob to avoid leaks before creating new one
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    try {
      // Lazy-load heavy engine only on demand — keeps main bundle lean
      const [{ render }, fonts] = await Promise.all([
        import("takumi-pdf"),
        loadInvoiceFonts(),
      ])

      const pdfBytes = await render(
        <InvoicePesananDocument data={data} />,
        buildInvoiceRenderOptions(data, fonts)
      )

      const blob = new Blob([pdfBytes as unknown as ArrayBuffer], {
        type: "application/pdf",
      })
      const url = URL.createObjectURL(blob)
      setBlobUrl(url)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Gagal generate PDF: validation failed"
      )
    } finally {
      setGenerating(false)
    }
  }, [data])

  // Auto-generate when dialog opens and data is ready
  useEffect(() => {
    if (!open) return
    if (isLoading || !data) return
    void generate()
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [open, data, isLoading, generate])

  // Cleanup blob on unmount or when data changes
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [blobUrl])

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open && blobUrl) {
      URL.revokeObjectURL(blobUrl)
      setBlobUrl(null)
      setError(null)
    }
  }, [open, blobUrl])

  const handleRefresh = useCallback(() => {
    if (onRefresh) onRefresh()
    void generate()
  }, [generate, onRefresh])

  const downloadPdf = useCallback(() => {
    if (!blobUrl || !data) return
    const a = document.createElement("a")
    a.href = blobUrl
    a.download = `Invoice-${String(data.nomor_struk ?? data.jumlah_paket)}-${String(data.created_at).slice(0, 10)}.pdf`
    a.click()
  }, [blobUrl, data])

  const printPdf = useCallback(() => {
    if (!blobUrl) return
    const iframe = document.createElement("iframe")
    iframe.src = blobUrl
    iframe.style.display = "none"
    document.body.appendChild(iframe)
    iframe.onload = () => {
      iframe.contentWindow?.print()
      // Remove iframe after print dialog
      setTimeout(() => iframe.remove(), 1000)
    }
  }, [blobUrl])

  // Loading skeleton while fetching struk data
  if (isLoading || !data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex h-[85vh] max-w-3xl flex-col gap-0 overflow-hidden rounded-xl shadow-xl">
          <DialogHeader className="border-b p-4">
            <DialogTitle className="font-heading">
              Pratinjau Invoice
            </DialogTitle>
            <DialogDescription>Memuat data struk...</DialogDescription>
          </DialogHeader>
          <div className="flex flex-1 flex-col gap-4 p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-3xl flex-col gap-0 overflow-hidden rounded-xl shadow-xl">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="font-heading">
            Pratinjau Invoice: {String(data.nomor_struk ?? "-")}
          </DialogTitle>
          <DialogDescription>
            {String(data.nama_pemesan ?? "-")} ·{" "}
            {new Date(String(data.created_at)).toLocaleDateString("id-ID")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 border-b bg-muted/30 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={generating}
          >
            {generating ? "Memproses..." : "Segarkan"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadPdf}
            disabled={!blobUrl || generating}
          >
            Unduh PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={printPdf}
            disabled={!blobUrl || generating}
          >
            Cetak
          </Button>
        </div>
        {error && (
          <div className="border-b bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {generating && !blobUrl ? (
          <div className="flex flex-1 flex-col gap-4 p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : blobUrl ? (
          <iframe
            src={blobUrl}
            className="w-full flex-1 border-0"
            title={`Invoice ${String(data.nomor_struk ?? "-")}`}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-muted-foreground">
            Klik Segarkan untuk memuat pratinjau invoice
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
