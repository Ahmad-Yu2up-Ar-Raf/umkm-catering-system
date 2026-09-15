"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { playDownload, playError, playNotification } from "@/lib/audio-feedback"

export type ExportFetcher = (params: Record<string, string | string[]>) => Promise<Blob>

interface UseExportExcelOptions {
  filename: string
  fetchBlob: ExportFetcher
}

export function useExportExcel({ filename, fetchBlob }: UseExportExcelOptions) {
  const [isExporting, setIsExporting] = useState(false)

  const run = useCallback(
    async (params: Record<string, string | string[]>) => {
      if (isExporting) return
      const id = toast.loading("Menyiapkan file Excel…")
      playNotification()
      setIsExporting(true)
      try {
        const blob = await fetchBlob(params)
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
    [filename, fetchBlob, isExporting]
  )

  return { isExporting, run }
}
