"use client"

import { memo, useCallback, useEffect, useRef, useState } from "react"
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

const sameUrlList = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((url, i) => url === b[i])

/* ------------------------------------------------------------------ *
 * Memoized tiles — one upload's progress tick never re-renders its
 * siblings. Keys are stable: `stored-${url}` / `file.id`.
 * ------------------------------------------------------------------ */

interface StoredTileProps {
  url: string
  isInvalid: boolean
  onRemove: (url: string) => void
}

const StoredTile = memo(function StoredTile({
  url,
  isInvalid,
  onRemove,
}: StoredTileProps) {
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-xl border bg-muted/30",
        isInvalid ? "border-destructive" : "border-border"
      )}
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
        className="absolute top-1.5 right-1.5 rounded-full border border-border bg-background/90 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => onRemove(url)}
      >
        <HugeiconsIcon icon={Cancel01Icon} />
      </Button>
    </div>
  )
})

interface PendingTileProps {
  file: MediaDropFile
  onRemove: (file: MediaDropFile) => void
  onRetry: (id: string) => void
}

const PendingTile = memo(function PendingTile({
  file,
  onRemove,
  onRetry,
}: PendingTileProps) {
  const status = file.uploadStatus ?? "queued"
  const url = readCanonical(file.uploadResult)
  const hasError = status === "error"

  return (
    <div
      className={cn(
        "relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border p-2 text-center",
        hasError ? "border-destructive bg-destructive/10" : "border-border bg-muted/30"
      )}
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
          className={cn(
            "size-6",
            hasError ? "text-destructive" : "text-muted-foreground"
          )}
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

      {hasError && (
        <p className="truncate text-[10px] text-destructive">
          {file.uploadError?.message ?? file.errors[0]?.message ?? "Gagal"}
        </p>
      )}

      <div className="absolute top-1.5 right-1.5 flex gap-1">
        {hasError && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Coba lagi"
            className="rounded-full border border-destructive bg-destructive/10 transition-colors hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onRetry(file.id)}
          >
            <HugeiconsIcon icon={RefreshIcon} />
          </Button>
        )}
        <Button
          type="button"
          aria-label={`Hapus ${file.name}`}
          variant="ghost"
          size="icon-xs"
          className={cn(
            "rounded-full border transition-colors",
            hasError
              ? "border-destructive bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              : "border-border bg-background/90 text-destructive hover:text-destructive"
          )}
          onClick={() => onRemove(file)}
        >
          <HugeiconsIcon icon={Cancel01Icon} />
        </Button>
      </div>
    </div>
  )
})

/**
 * Headless mediadrop dropzone + tile grid.
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

  /** Canonical URLs already folded into the form value — prevents re-folding
   * after an external reset wipes `localUrls`. State (not a ref) so render
   * can derive `pendingFiles` from it. */
  const [foldedUrls, setFoldedUrls] = useState<ReadonlySet<string>>(() => new Set())

  const {
    getRootProps,
    getInputProps,
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
  useEffect(() => {
    const fresh = acceptedFiles.some(
      (f) => f.status === "accepted" && !f.uploadStatus
    )
    if (fresh) uploadAll()
  }, [acceptedFiles, uploadAll])

  // Fold completed uploads into the value exactly once per canonical URL.
  useEffect(() => {
    const fresh = acceptedFiles
      .filter((f) => f.uploadStatus === "done" && f.uploadResult)
      .map((f) => readCanonical(f.uploadResult))
      .filter((url) => url !== "" && !foldedUrls.has(url))
    if (fresh.length === 0) return

    // Folding settled upload results into form value is the effect's job;
    // both updates land in one batched commit.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFoldedUrls((prev) => {
      const next = new Set(prev)
      fresh.forEach((url) => next.add(url))
      return next
    })
    setLocalUrls((prev) => {
      if (!multiple) return [fresh[fresh.length - 1]]
      return [...prev, ...fresh.filter((url) => !prev.includes(url))]
    })
  }, [acceptedFiles, multiple, foldedUrls])

  // Adopt EXTERNAL value changes (form.reset / drawer seeding) via React's
  // render-time derived-state pattern. Our own emits round-trip back as an
  // identical list, so they are no-ops here.
  const [prevExternalUrls, setPrevExternalUrls] = useState(urls)
  if (!sameUrlList(prevExternalUrls, urls)) {
    setPrevExternalUrls(urls)
    if (!sameUrlList(localUrls, urls)) {
      setLocalUrls(urls)
    }
  }

  // Emit upward.
  useEffect(() => {
    onChangeRef.current(localUrls)
  }, [localUrls])

  // Reconcile in-flight uploads.
  const uploading = acceptedFiles.some(
    (f) => !f.uploadStatus || f.uploadStatus === "queued" || f.uploadStatus === "uploading"
  )
  useEffect(() => {
    adjustActiveUploads(uploading ? 1 : 0)
    return () => adjustActiveUploads(uploading ? -1 : 0)
  }, [uploading])

  const handleRemoveStored = useCallback((url: string) => {
    setLocalUrls((prev) => prev.filter((u) => u !== url))
  }, [])

  const handleRemovePending = useCallback(
    (file: MediaDropFile) => {
      const canonical = readCanonical(file.uploadResult)
      if (canonical) {
        setFoldedUrls((prev) => new Set(prev).add(canonical))
        setLocalUrls((prev) => prev.filter((u) => u !== canonical))
      }
      removeFile(file.id)
    },
    [removeFile]
  )

  const handleRetry = useCallback(
    (id: string) => retryUpload(id),
    [retryUpload]
  )

  const storedUrls = localUrls
  const pendingFiles = acceptedFiles.filter((file) => {
    if (file.uploadStatus === "done") {
      const canonical = readCanonical(file.uploadResult)
      return canonical === "" || !foldedUrls.has(canonical)
    }
    return true
  })

  const hasAccepted = acceptedFiles.length > 0
  const atLimit = multiple
    ? hasAccepted && acceptedFiles.length >= maxFiles
    : hasAccepted || storedUrls.length > 0

  return (
    <div className={cn("flex w-full flex-col gap-3", disabled && "pointer-events-none opacity-50")}>
      {(storedUrls.length > 0 || pendingFiles.length > 0) && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {storedUrls.map((url) => (
            <StoredTile
              key={`stored-${url}`}
              url={url}
              isInvalid={isInvalid}
              onRemove={handleRemoveStored}
            />
          ))}

          {pendingFiles.map((file) => (
            <PendingTile
              key={file.id}
              file={file}
              onRemove={handleRemovePending}
              onRetry={handleRetry}
            />
          ))}
        </div>
      )}

      {!atLimit && (
        <div
          {...getRootProps()}
          data-drag-active={isDragActive || undefined}
          data-drag-reject={isDragReject || undefined}
          aria-invalid={isInvalid || undefined}
          className={cn(
            "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed p-4 text-center transition-all",
            isDragActive && "border-primary bg-primary/5",
            isDragReject && "border-destructive/60 bg-destructive/5",
            isInvalid && "border-destructive bg-destructive/10",
            !isDragActive && !isDragReject && !isInvalid && "border-border bg-background/40 hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <input {...getInputProps()} aria-label="Unggah gambar" />
          <HugeiconsIcon
            icon={Upload01Icon}
            className={cn(
              "size-5",
              isInvalid ? "text-destructive" : "text-muted-foreground"
            )}
          />
          <p className={cn(
            "text-xs font-medium",
            isInvalid ? "text-destructive" : "text-foreground"
          )}>
            {isDragActive
              ? "Lepaskan gambar di sini"
              : "Letakkan gambar di sini, atau klik untuk memilih"}
          </p>
          <p className={cn(
            "text-[11px]",
            isInvalid ? "text-destructive/80" : "text-muted-foreground"
          )}>
            PNG, JPG atau WebP — maks 5MB per file
          </p>
        </div>
      )}
    </div>
  )
}
