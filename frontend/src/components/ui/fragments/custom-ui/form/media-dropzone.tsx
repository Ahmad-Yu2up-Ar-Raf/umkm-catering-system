"use client"

import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Image01Icon, Upload01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export type ImageItem = File | string

interface MediaDropzoneProps {
  items: ImageItem[]
  onChange: (items: ImageItem[]) => void
  multiple?: boolean
  maxFiles?: number
  isInvalid?: boolean
  disabled?: boolean
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"]
const MAX_BYTES = 5 * 1024 * 1024

/**
 * Object-URL cache for local File previews. ponytail: URLs live for the page
 * session and are revoked when their tile is removed — a handful of preview
 * URLs per form session is a negligible ceiling.
 */
const previewUrls = new WeakMap<File, string>()

function previewFor(file: File): string {
  let url = previewUrls.get(file)
  if (!url) {
    url = URL.createObjectURL(file)
    previewUrls.set(file, url)
  }
  return url
}

const itemKey = (item: ImageItem, index: number): string =>
  typeof item === "string"
    ? `u-${item}`
    : `f-${item.name}-${item.size}-${item.lastModified}-${index}`

const itemMatches = (a: ImageItem, b: ImageItem): boolean =>
  a === b || (typeof a !== "string" && typeof b !== "string" && a === b)

interface TileProps {
  item: ImageItem
  isInvalid: boolean
  onRemove: (item: ImageItem) => void
}

const Tile = function Tile({ item, isInvalid, onRemove }: TileProps) {
  const isFile = typeof item !== "string"

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-xl border bg-muted/30",
        isInvalid ? "border-destructive" : "border-border"
      )}
    >
      {isFile ? (
        <div
          role="img"
          aria-label={item.name}
          className="size-full bg-cover bg-center"
          style={{ backgroundImage: `url(${previewFor(item)})` }}
        />
      ) : (
        <MediaItem
          webViewLink={item}
          alt="Gambar paket"
          layout="constrained"
          width={240}
          height={240}
          className="size-full"
        />
      )}
      {isFile && (
        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-background/90 px-2 py-0.5 text-[10px] text-muted-foreground">
          Siap diunggah
        </span>
      )}
      <Button
        type="button"
        aria-label="Hapus gambar"
        variant="ghost"
        size="icon-xs"
        className="absolute top-1.5 right-1.5 rounded-full border border-border bg-background/90 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => onRemove(item)}
      >
        <HugeiconsIcon icon={Cancel01Icon} />
      </Button>
    </div>
  )
}

/**
 * Deferred-upload dropzone. Holds raw `File` objects (local previews) and
 * committed Cloudinary URLs side by side; NOTHING touches the network here.
 * Files are uploaded to Cloudinary only during form submit (see
 * `usePaketForm.onSubmit`), so cancelling a draft or removing a tile can
 * never orphan a remote asset.
 */
export function MediaDropzone({
  items,
  onChange,
  multiple = false,
  maxFiles = 8,
  isInvalid = false,
  disabled = false,
}: MediaDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const accepted: File[] = []
      for (const file of Array.from(incoming)) {
        if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_BYTES) continue
        if (items.some((it) => it !== file && it instanceof File && it.name === file.name && it.size === file.size)) continue
        accepted.push(file)
        if (!multiple) break
      }
      if (accepted.length === 0) return

      const next = multiple
        ? [...items, ...accepted].slice(0, maxFiles)
        : [accepted[accepted.length - 1]]
      onChange(next)
    },
    [items, multiple, maxFiles, onChange]
  )

  const handleRemove = useCallback(
    (target: ImageItem) => {
      if (typeof target !== "string") {
        const url = previewUrls.get(target)
        if (url) {
          URL.revokeObjectURL(url)
          previewUrls.delete(target)
        }
      }
      onChange(items.filter((it) => !itemMatches(it, target)))
    },
    [items, onChange]
  )

  const atLimit = items.length >= (multiple ? maxFiles : 1)

  return (
    <div className={cn("flex w-full flex-col gap-3", disabled && "pointer-events-none opacity-50")}>
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((item, index) => (
            <Tile
              key={itemKey(item, index)}
              item={item}
              isInvalid={isInvalid}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {!atLimit && (
        <div
          data-drag-active={isDragActive || undefined}
          aria-invalid={isInvalid || undefined}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragActive(true)
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragActive(false)
            if (!disabled) addFiles(e.dataTransfer.files)
          }}
          className={cn(
            "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed p-4 text-center transition-all",
            isDragActive && "border-primary bg-primary/5",
            isInvalid && "border-destructive bg-destructive/10",
            !isDragActive && !isInvalid && "border-border bg-background/40 hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple={multiple}
            aria-label="Unggah gambar"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files)
              e.target.value = ""
            }}
          />
          <HugeiconsIcon
            icon={Image01Icon}
            className={cn("size-5", isInvalid ? "text-destructive" : "text-muted-foreground")}
          />
          <p className={cn("text-xs font-medium", isInvalid ? "text-destructive" : "text-foreground")}>
            {isDragActive
              ? "Lepaskan gambar di sini"
              : "Letakkan gambar di sini, atau klik untuk memilih"}
          </p>
          <p className={cn("text-[11px]", isInvalid ? "text-destructive/80" : "text-muted-foreground")}>
            PNG, JPG atau WebP — maks 5MB per file
          </p>
          <span className="sr-only">
            <HugeiconsIcon icon={Upload01Icon} className="size-4" />
          </span>
        </div>
      )}
    </div>
  )
}
