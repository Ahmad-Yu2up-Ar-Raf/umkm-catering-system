"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { toast } from "sonner"
import { playDownload, playError, playNotification } from "@/lib/audio-feedback"
import { HTTPError } from "ky"
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
/**
 * Fail-fast circuit breaker: `pending` with no worker pickup for >30s means
 * the queue worker is dead, idle, or never received the job — terminate now
 * instead of polling a silent queue until the absolute deadline.
 */
const PENDING_SILENCE_MS = 30_000
/**
 * Fail-fast circuit breaker: `processing` with no row progress for >45s means
 * the job stalled (DB hang, OOM, lost heartbeat) — terminate now.
 */
const PROCESSING_STALL_MS = 45_000
/**
 * Absolute backstop: 6 min. Must exceed the job budget ($timeout 240s) so a
 * healthy-but-slow export is never killed client-side first. Every stuck case
 * trips the 30s/45s breaker long before this fires.
 */
const POLL_DEADLINE_MS = 6 * 60_000

/** Thrown the moment the circuit breaker opens — never loop silently. */
const CIRCUIT_OPEN_MESSAGE = "Worker export tidak merespon — silakan coba lagi."

interface ExportPollState {
  status: string
  message?: string
  stale?: boolean
  rows?: number
  total?: number
}

function httpStatusOf(err: unknown): number | null {
  return err instanceof HTTPError ? err.response.status : null
}

async function pollExportBlob(
  module: AsyncExportModule,
  params: Record<string, string | string[]>,
  signal: AbortSignal,
  onProgress?: (rows?: number, total?: number) => void
): Promise<Blob> {
  let token: string
  try {
    // Small exports build inline (incl. thumbnail downloads) inside the POST —
    // needs longer than the global 30s ky timeout, same 120s as the download.
    const queued = await api
      .post(`admin/exports/${module}`, { json: params, timeout: 120_000 })
      .json<{ data: { token: string } }>()
    token = queued.data.token
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err
    const status = httpStatusOf(err)
    throw new Error(
      status !== null ? `Export gagal dimulai (HTTP ${status}) — coba lagi` : "Koneksi terputus saat memulai export",
      { cause: err }
    )
  }
  // Immutable anchor: assigned exactly once per export run inside this closure
  // (never a ref/state, never reset by re-renders) — all elapsed math is absolute.
  const pollStart = Date.now()
  console.log(`[ExportPoll] dispatch ok module=${module} token=${token}`)
  const deadline = pollStart + POLL_DEADLINE_MS
  let attempt = 0
  let networkErrors = 0
  let lastState: ExportPollState | null = null
  let lastProgressAt = pollStart
  let lastRows = -1
  const noteProgress = (state: ExportPollState, at: number): void => {
    if (state.status !== "processing") return
    const rows = typeof state.rows === "number" ? state.rows : lastRows
    if (rows > lastRows) {
      lastRows = rows
      lastProgressAt = at
    }
  }
  // True once silence exceeds the fail-fast budget. Evaluated BEFORE sleeping
  // (backoff must not delay detection) and again after every poll.
  const breakerTripped = (state: ExportPollState | null, at: number): boolean => {
    if (state === null) return false
    if (state.status === "processing") {
      const rows = typeof state.rows === "number" ? state.rows : lastRows
      if (rows > lastRows) return false
      return at - lastProgressAt > PROCESSING_STALL_MS
    }
    // `pending` (or unknown status) that never advances: worker never picked up.
    return at - pollStart > PENDING_SILENCE_MS
  }
  for (;;) {
    if (signal.aborted) throw new DOMException("export cancelled", "AbortError")
    if (Date.now() > deadline) throw new Error("Export timeout — file terlalu besar, coba filter lebih spesifik")
    if (breakerTripped(lastState, Date.now())) throw new Error(CIRCUIT_OPEN_MESSAGE)
    const delay = POLL_DELAYS[Math.min(attempt, POLL_DELAYS.length - 1)]
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, delay)
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(t)
          reject(new DOMException("export cancelled", "AbortError"))
        },
        { once: true }
      )
    })
    attempt += 1
    let state: ExportPollState
    try {
      const res = await api.get(`admin/exports/${token}`, { signal })
      state = ((await res.json()) as { data: ExportPollState }).data
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err
      const status = httpStatusOf(err)
      if (status !== null) {
        // Terminal HTTP failure — surface now, never mask as transient.
        if (status === 404) throw new Error("Export kedaluwarsa — silakan ulangi", { cause: err })
        if (status === 401) throw new Error("Sesi berakhir — silakan login kembali", { cause: err })
        throw new Error(`Export gagal di server (HTTP ${status}) — coba lagi`, { cause: err })
      }
      // Genuine network blip only: 2 retries, then terminal.
      networkErrors += 1
      if (networkErrors > 2) throw new Error("Koneksi terputus saat memantau export", { cause: err })
      continue
    }
    if (state.status === "ready") break
    if (state.status === "failed") throw new Error(state.message || "Export gagal di server")
    if (state.stale) throw new Error("Worker export berhenti — coba lagi")
    // Circuit breaker: silence without progress is terminal — never loop blindly.
    const at = Date.now()
    noteProgress(state, at)
    lastState = state
    console.log(
      `[ExportPoll] elapsed=${((at - pollStart) / 1000).toFixed(0)}s status=${state.status} rows=${state.rows ?? "?"}/${state.total ?? "?"} attempt=${attempt} nextPollIn=${delay}ms`
    )
    if (breakerTripped(state, at)) throw new Error(CIRCUIT_OPEN_MESSAGE)
    if (typeof onProgress === "function") onProgress(state.rows, state.total)
  }
  // Large xlsx needs longer than the global 30s ky timeout; abortable via run's controller.
  try {
    return await api.get(`admin/exports/${token}/download`, { signal, timeout: 120_000 }).blob()
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err
    const status = httpStatusOf(err)
    if (status === 409) throw new Error("Export belum siap — silakan ulangi", { cause: err })
    if (status === 404) throw new Error("File export hilang — silakan ulangi", { cause: err })
    if (status !== null) throw new Error(`Unduhan gagal (HTTP ${status}) — coba lagi`, { cause: err })
    throw new Error("Koneksi terputus saat mengunduh export", { cause: err })
  }
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
          ? await pollExportBlob(asyncModule, params, controller.signal, (rows, total) => {
              const label =
                typeof rows === "number" && typeof total === "number" && total > 0
                  ? `Menyiapkan file Excel… (${rows}/${total} baris)`
                  : "Menyiapkan file Excel…"
              toast.loading(label, { id })
            })
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
