"use client"

import { useCallback, useEffect, useState } from "react"
import { render } from "takumi-pdf"
import { googleFonts } from "@takumi-rs/helpers"
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
import type { StrukPayload } from "@/components/ui/core/block/admin/pesanan/types/pesanan-types"

interface Props {
  data: StrukPayload | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading?: boolean
}

export function InvoicePreviewDialog({ data, open, onOpenChange, isLoading = false }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const generate = useCallback(async () => {
    if (!data) return
    setGenerating(true)
    setError(null)
    try {
      const fonts = await googleFonts(["Space Grotesk", "Fraunces", "Instrument Serif"])

      const pdfBytes = await render(<InvoicePesananDocument data={data} />, {
        size: "a4",
        fonts,
        margin: { top: 48, bottom: 56, left: 48, right: 48 },
        pdfa: "3b",
        tagged: "ua1",
        metadata: {
          title: `Invoice ${data.nomor_struk}`,
          creationDate: new Date().toISOString().split("T")[0],
        },
      })

      const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      setBlobUrl(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal generate PDF")
    } finally {
      setGenerating(false)
    }
  }, [data])

  useEffect(() => {
    if (!open) return

    let cancelled = false

    async function generatePdf() {
      if (!data) return
      setGenerating(true)
      setError(null)
      try {
        const fonts = await googleFonts(["Space Grotesk", "Fraunces", "Instrument Serif"])

        const pdfBytes = await render(<InvoicePesananDocument data={data!} />, {
          size: "a4",
          fonts,
          margin: { top: 48, bottom: 56, left: 48, right: 48 },
          pdfa: "3b",
          tagged: "ua1",
          metadata: {
            title: `Invoice ${data?.nomor_struk}`,
            creationDate: new Date().toISOString().split("T")[0],
          },
        })

        if (cancelled) return

        const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        setBlobUrl(url)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Gagal generate PDF")
        }
      } finally {
        if (!cancelled) {
          setGenerating(false)
        }
      }
    }

    void generatePdf()

    return () => {
      cancelled = true
    }
  }, [data, open])

  const downloadPdf = useCallback(() => {
    if (!blobUrl) return
    const a = document.createElement("a")
    a.href = blobUrl
    a.download = `Invoice-${data?.nomor_struk}.pdf`
    a.click()
  }, [blobUrl, data?.nomor_struk])

  const printPdf = useCallback(() => {
    if (!blobUrl) return
    const iframe = document.createElement("iframe")
    iframe.src = blobUrl
    iframe.style.display = "none"
    document.body.appendChild(iframe)
    iframe.onload = () => iframe.contentWindow?.print()
  }, [blobUrl])

  // Loading skeleton while fetching struk data
  if (isLoading || !data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex h-[85vh] max-w-3xl flex-col gap-0 overflow-hidden rounded-xl shadow-xl">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="font-heading">Pratinjau Invoice</DialogTitle>
            <DialogDescription>Memuat data struk...</DialogDescription>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="h-64 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-3xl flex-col gap-0 overflow-hidden rounded-xl shadow-xl">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="font-heading">Pratinjau Invoice: {data?.nomor_struk}</DialogTitle>
          <DialogDescription>
            {data?.nama_pemesan} · {new Date(data?.created_at).toLocaleDateString("id-ID")}
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 flex gap-2 border-b bg-muted/30">
          <Button variant="outline" size="sm" onClick={generate} disabled={generating || !data}>
            {generating ? "Memproses..." : "Segarkan"}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPdf} disabled={!blobUrl || !data}>
            Unduh PDF
          </Button>
          <Button variant="outline" size="sm" onClick={printPdf} disabled={!blobUrl || !data}>
            Cetak
          </Button>
        </div>
        {error && (
          <div className="p-4 text-sm text-destructive bg-destructive/10 border-b">
            {error}
          </div>
        )}
        {blobUrl ? (
          <iframe
            src={blobUrl}
            className="w-full h-[calc(85vh-200px)] border-0"
            title={`Invoice ${data?.nomor_struk}`}
          />
        ) : (
          <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
            Klik "Segarkan" untuk memuat pratinjau invoice
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}