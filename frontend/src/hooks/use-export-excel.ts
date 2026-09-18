"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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

/** Poll delays: exponential backoff 1s → 2s → 4s → 8s, capped at 10s. */
const POLL_DELAYS = [1000, 2000, 4000, 8000, 10000]
/** Absolute poll deadline: 5 min (under the 1h server cache TTL). */
const POLL_DEADLINE_MS = 5 * 60_000

async function pollExportBlob(
  module: AsyncExportModule,
  params: Record<string, string | string[]>,
  signal: AbortSignal
): Promise<Blob> {
  const queued = await api
    .post(`admin/exports/${module}`, { json: params })
    .json<{ data: { token: string } }>()
  const token = queued.data.token
  const deadline = Date.now() + POLL_DEADLINE_MS
  let attempt = 0
  let networkErrors = 0
  for (;;) {
    if (signal.aborted) throw new DOMException("export cancelled", "AbortError")
    if (Date.now() > deadline) throw new Error("Export timeout — file terlalu besar, coba filter lebih spesifik")
    const delay = POLL_DELAYS[Math.min(attempt, POLL_DELAYS.length - 1)]
    await new Promise((resolve, reject) => {
      const t = setTimeout(resolve, delay)
      signal.addEventListener("abort", () => {
        clearTimeout(t)
        reject(new DOMException("export cancelled", "AbortError"))
      })
    })
    attempt += 1
    let res: Response
    try {
      res = await api.get(`admin/exports/${token}`, { signal })
    } catch (err) {
      // Transient network blip: 2 retries, then terminal.
      networkErrors += 1
      if (err instanceof DOMException && err.name === "AbortError") throw err
      if (networkErrors > 2) throw new Error("Koneksi terputus saat memantau export")
      continue
    }
    if (res.status === 404) throw new Error("Export kedaluwarsa — silakan ulangi")
    if (res.status === 401) throw new Error("Sesi berakhir — silakan login kembali")
    const state = await res.json<{ data: { status: string; message?: string; stale?: boolean } }>()
    if (state.data.status === "ready") break
    if (state.data.status === "failed") throw new Error(state.data.message || "Export gagal di server")
    if (state.data.stale) throw new Error("Worker export berhenti — coba lagi")
  }
  const blob = await api.get(`admin/exports/${token}/download`).blob()
  return blob
}

export function useExportExcel({ filename, fetchBlob, asyncModule }: UseExportExcelOptions) {
  const [isExporting, setIsExporting] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const run = useCallback(
    async (params: Record<string, string | string[]>) => {
      if (isExporting) return
      const id = toast.loading("Menyiapkan file Excel…")
      playNotification()
      setIsExporting(true)
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const blob = asyncModule
          ? await pollExportBlob(asyncModule, params, controller.signal)
          : await fetchBlob(params)
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
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          toast.dismiss(id)
        } else {
          toast.error(err instanceof Error ? err.message : "Export Excel gagal — coba lagi", { id })
        }
        playError()
      } finally {
        abortRef.current = null
        setIsExporting(false)
      }
    },
    [filename, fetchBlob, asyncModule, isExporting]
  )

  useEffect(() => cancel, [cancel])

  return { isExporting, run, cancel }
}
