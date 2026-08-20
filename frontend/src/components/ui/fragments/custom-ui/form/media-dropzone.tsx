"use client"

import { useEffect, useRef, useState } from "react"
import { useMediaDrop, type MediaDropFile } from "react-mediadrop"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  Image01Icon,
  RefreshIcon,
  Upload01Icon,
} from "@hugeicons/core-free-icons"
import { adjustActiveUploads } from "@/store/paket-upload-store"
import {
  cloudinaryTransport,
  toCanonicalCloudinaryUrl,
} from "@/lib/cloudinary"
import { cn } from "@/lib/utils"

interface MediaDropzoneProps {
  urls: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
  maxFiles?: number
  isInvalid?: boolean
  disabled?: boolean
}

interface UploadResultLike {
  public_id?: string
  version?: number | string
  format?: string
  secure_url?: string
}

const readCanonical = (input: unknown): string =>
  toCanonicalCloudinaryUrl(input as UploadResultLike)

/**
 * Headless mediadrop dropzone + tile grid — the ONLY upload UI in the admin
 * paket form. Files upload to Cloudinary immediately on selection (concurrency
 * 3, shared retry/backoff, cancel via AbortSignal) and the field value is the
 * resulting canonical URLs — the form submit never touches file bytes.
 */
export function MediaDropzone({
  urls,
  onChange,
  multiple = false,
  maxFiles = 8,
  isInvalid = false,
  disabled = false,
}: MediaDropzoneProps) {
  const [localUrls, setLocalUrls] = useState<string[]>(urls)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const {
    getRootProps,
    getInputProps,
    open,
    acceptedFiles,
    isDragActive,
    isDragReject,
    removeFile,
    uploadAll,
    retryUpload,
  } = useMediaDrop({
    transport: cloudinaryTransport,
    concurrency: 3,
    retries: 1,
    retryDelays: [1500, 3000],
    restrictions: {
      accept: ["image/png", "image/jpeg", "image/webp"],
      maxFiles,
      maxSize: 5 * 1024 * 1024,
    },
  })

  // Auto-queue freshly accepted files.
  // NOTE: localUrls is initialized from `urls` and stays in sync through the
  // onChange round-trip; external resets remount the dropzone via the drawer's
  // key, so no prop-sync effect is needed here.
  useEffect(() => {
    const fresh = acceptedFiles.some(
      (f) => f.status === "accepted" && !f.uploadStatus
    )
    if (fresh) uploadAll()
  }, [acceptedFiles, uploadAll])

  // Fold completed uploads into the value (single → replace, multiple → append).
  useEffect(() => {
    const settled = [
      ...new Set(
        acceptedFiles
          .filter((f) => f.uploadStatus === "done" && f.uploadResult)
          .map(readCanonical)
          .filter(Boolean)
      ),
    ]
    if (settled.length === 0) return
    // Synchronizing upload results into local state from an effect is the
    // required React pattern here (state is derived from the mediadrop engine).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalUrls((prev) => {
      if (multiple) {
        return [...prev, ...settled.filter((url) => !prev.includes(url))]
      }
      return settled.slice(-1)
    })
  }, [acceptedFiles, multiple])

  // Emit upward.
  useEffect(() => {
    onChangeRef.current(localUrls)
  }, [localUrls])

  // Reconcile in-flight uploads against the shared store (exact once-per-state).
  const uploading = acceptedFiles.some(
    (f) => !f.uploadStatus || f.uploadStatus === "queued" || f.uploadStatus === "uploading"
  )
  useEffect(() => {
    adjustActiveUploads(uploading ? 1 : 0)
    return () => adjustActiveUploads(uploading ? -1 : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploading])

  const removeStored = (url: string) => {
    setLocalUrls((prev) => prev.filter((u) => u !== url))
  }

  const removePending = (file: MediaDropFile) => {
    const canonical = readCanonical(file.uploadResult)
    if (canonical) removeStored(canonical)
    removeFile(file.id)
  }

  const storedUrls = new Set(localUrls)
  const pendingFiles = acceptedFiles.filter((file) => {
    const canonical = readCanonical(file.uploadResult)
    return !(file.uploadStatus === "done" && canonical && storedUrls.has(canonical))
  })

  const hasAccepted = acceptedFiles.length > 0
  const atLimit = multiple ? hasAccepted && acceptedFiles.length >= maxFiles : hasAccepted

  return (
    <div className={cn("flex w-full flex-col gap-3", disabled && "pointer-events-none opacity-50")}>
      {(localUrls.length > 0 || pendingFiles.length > 0) && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {localUrls.map((url) => (
            <div
              key={`stored-${url}`}
              className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted/30"
            >
              <MediaItem
                webViewLink={url}
                alt="Gambar paket"
                layout="constrained"
                width={240}
                height={240}
                className="size-full"
              />
              <Button
                type="button"
                aria-label="Hapus gambar"
                variant="ghost"
                size="icon-xs"
                className="absolute top-1.5 right-1.5 rounded-full border border-border bg-background/90 text-destructive shadow-sm hover:text-destructive"
                onClick={() => removeStored(url)}
              >
                <HugeiconsIcon icon={Cancel01Icon} />
              </Button>
            </div>
          ))}

          {pendingFiles.map((file) => {
            const status = file.uploadStatus ?? "queued"
            const url = readCanonical(file.uploadResult)
            return (
              <div
                key={file.id}
                className="relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-border bg-muted/30 p-2 text-center"
              >
                {url ? (
                  <MediaItem
                    webViewLink={url}
                    alt={file.name}
                    layout="constrained"
                    width={240}
                    height={240}
                    className="size-full"
                  />
                ) : (
                  <HugeiconsIcon
                    icon={Image01Icon}
                    className="size-6 text-muted-foreground"
                  />
                )}

                {status === "uploading" && (
                  <div className="absolute inset-x-2 bottom-1.5 space-y-1">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-[width]"
                        style={{
                          width: `${
                            file.progress?.total
                              ? Math.round(
                                  ((file.progress.loaded ?? 0) / file.progress.total) * 100
                                )
                              : 30
                          }%`,
                        }}
                      />
                    </div>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {file.name} · Mengunggah…
                    </p>
                  </div>
                )}

                {status === "queued" && (
                  <p className="truncate text-[10px] text-muted-foreground">
                    {file.name} · Menunggu…
                  </p>
                )}

                {status === "error" && (
                  <p className="truncate text-[10px] text-destructive">
                    {file.uploadError?.message ?? file.errors[0]?.message ?? "Gagal"}
                  </p>
                )}

                <div className="absolute top-1.5 right-1.5 flex gap-1">
                  {status === "error" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Coba lagi"
                      className="rounded-full border border-border bg-background/90 shadow-sm"
                      onClick={() => retryUpload(file.id)}
                    >
                      <HugeiconsIcon icon={RefreshIcon} />
                    </Button>
                  )}
                  <Button
                    type="button"
                    aria-label={`Hapus ${file.name}`}
                    variant="ghost"
                    size="icon-xs"
                    className="rounded-full border border-border bg-background/90 text-destructive shadow-sm hover:text-destructive"
                    onClick={() => removePending(file)}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!atLimit && (
        <div
          {...getRootProps()}
          data-drag-active={isDragActive || undefined}
          data-drag-reject={isDragReject || undefined}
          aria-invalid={isInvalid || undefined}
          className={cn(
            "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border bg-background/40 p-4 text-center transition-colors",
            isDragActive && "border-primary bg-primary/5",
            isDragReject && "border-destructive/60 bg-destructive/5",
            isInvalid && "border-destructive/60"
          )}
        >
          <input {...getInputProps()} aria-label="Unggah gambar" />
          <HugeiconsIcon icon={Upload01Icon} className="size-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {isDragActive
              ? "Lepaskan gambar di sini"
              : "Letakkan gambar di sini, atau klik untuk memilih"}
          </p>
          <p className="text-xs text-muted-foreground/70">
            PNG, JPG atau WebP — maks 5MB per file
          </p>
        </div>
      )}

      {!atLimit && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={open}
        >
          <HugeiconsIcon icon={Upload01Icon} className="size-4" />
          Pilih Gambar
        </Button>
      )}
    </div>
  )
}
