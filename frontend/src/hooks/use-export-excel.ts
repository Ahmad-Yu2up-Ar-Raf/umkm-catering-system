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
/** Modules whose exports embed Cloudinary thumbnails (slow, serial fetches). */
const IMAGE_MODULES: ReadonlySet<AsyncExportModule> = new Set(["paket", "galeri"])
/**
 * Fail-fast circuit breaker: `pending` with no worker pickup means the queue
 * worker is dead, idle, or never received the job — terminate instead of
 * polling a silent queue until the absolute deadline. Image modules get 120s
 * (single DB worker + HF cold start + COUNT/probe on the HTTP worker); text
 * modules keep the strict 30s budget.
 */
const PENDING_SILENCE_MS = 30_000
const PENDING_SILENCE_IMAGE_MS = 120_000
/**
 * Fail-fast circuit breaker: `processing` with no row progress means the job
 * stalled (DB hang, OOM, lost heartbeat) — terminate now. Heartbeats younger
 * than HEARTBEAT_FRESH_MS prove liveness even when rows advance slowly, so a
 * live-but-slow worker is never killed. Image modules get 120s (single worker
 * + Neon WAN latency); text keeps 45s. Exports stream HYPERLINK text since
 * thumbnail embedding was disabled server-side, so healthy jobs finish in
 * seconds — this budget only binds genuinely dead workers.
 */
const PROCESSING_STALL_MS = 45_000
const PROCESSING_STALL_IMAGE_MS = 120_000
const HEARTBEAT_FRESH_MS = 60_000
/**
 * Absolute backstop: 6 min text, 12 min image modules. Healthy exports finish
 * in seconds (streaming, no image fetches), so this never binds a live job —
 * it only caps the worst case below the 3600s status-cache TTL. Every stuck
 * case trips the pending/stall breaker long before this fires.
 */
const POLL_DEADLINE_MS = 6 * 60_000
const POLL_DEADLINE_IMAGE_MS = 12 * 60_000

/** Thrown the moment the circuit breaker opens — never loop silently. */
const CIRCUIT_OPEN_MESSAGE = "Worker export tidak merespon — silakan coba lagi."

interface ExportPollState {
  status: string
  message?: string
  stale?: boolean
  rows?: number
  total?: number
  heartbeat_at?: string
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
  const deadline = pollStart + (IMAGE_MODULES.has(module) ? POLL_DEADLINE_IMAGE_MS : POLL_DEADLINE_MS)
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
  const heartbeatFresh = (state: ExportPollState, at: number): boolean => {
    if (typeof state.heartbeat_at !== "string") return false
    const beat = Date.parse(state.heartbeat_at)
    if (Number.isNaN(beat)) return false
    return at - beat < HEARTBEAT_FRESH_MS
  }
  const isImage = IMAGE_MODULES.has(module)
  const pendingBudget = isImage ? PENDING_SILENCE_IMAGE_MS : PENDING_SILENCE_MS
  const stallBudget = isImage ? PROCESSING_STALL_IMAGE_MS : PROCESSING_STALL_MS
  const breakerTripped = (state: ExportPollState | null, at: number): boolean => {
    if (state === null) return false
    if (state.status === "processing") {
      const rows = typeof state.rows === "number" ? state.rows : lastRows
      if (rows > lastRows) return false
      // Slow but alive (fresh heartbeat, e.g. mid long image row) ≠ dead.
      if (heartbeatFresh(state, at)) return false
      return at - lastProgressAt > stallBudget
    }
    // `pending` (or unknown status) that never advances: worker never picked up.
    return at - pollStart > pendingBudget
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
              // Live progress on the same toast id (no flicker, no duplicates);
              // falls back to the static label while rows/total are unknown
              // (pending phase, sync exports) — never prints NaN/undefined.
              const label =
                typeof rows === "number" && typeof total === "number" && total > 0
                  ? `Memproses data... (${rows} dari ${total})`
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
