"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { playDownload, playError, playNotification } from "@/lib/audio-feedback"
import { api } from "@/api/client"

export type ExportFetcher = (params: Record<string, string | string[]>) => Promise<Blob>

export type AsyncExportModule = "paket" | "galeri" | "pesanan" | "testimoni"

interface UseExportExcelOptions {
  filename: string
  fetchBlob: ExportFetcher
  /** When set, large exports go through the queued 202→poll→download flow. */
  asyncModule?: AsyncExportModule
}

async function pollExportBlob(module: AsyncExportModule, params: Record<string, string | string[]>): Promise<Blob> {
  const queued = await api
    .post(`admin/exports/${module}`, { json: params })
    .json<{ data: { token: string } }>()
  const token = queued.data.token
  const deadline = Date.now() + 10 * 60_000
  for (;;) {
    if (Date.now() > deadline) throw new Error("export timeout")
    await new Promise((r) => setTimeout(r, 2000))
    const state = await api
      .get(`admin/exports/${token}`)
      .json<{ data: { status: string; message?: string } }>()
    if (state.data.status === "ready") break
    if (state.data.status === "failed") throw new Error(state.data.message || "export failed")
  }
  return api.get(`admin/exports/${token}/download`).blob()
}

export function useExportExcel({ filename, fetchBlob, asyncModule }: UseExportExcelOptions) {
  const [isExporting, setIsExporting] = useState(false)

  const run = useCallback(
    async (params: Record<string, string | string[]>) => {
      if (isExporting) return
      const id = toast.loading("Menyiapkan file Excel…")
      playNotification()
      setIsExporting(true)
      try {
        const blob = asyncModule ? await pollExportBlob(asyncModule, params) : await fetchBlob(params)
        if (!blob.size) throw new Error("empty blob")
        // Prefer server filename via blob type; fallback to requested name
        const url = URL.createObjectURL(
          new Blob([blob], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          })
        )
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 10_000)
        toast.success("Export Excel berhasil", { id })
        playDownload()
      } catch {
        toast.error("Export Excel gagal — coba lagi", { id })
        playError()
      } finally {
        setIsExporting(false)
      }
    },
    [filename, fetchBlob, asyncModule, isExporting]
  )

  return { isExporting, run }
}
