"use client"

import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  Image01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons"
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
  isThumbnail?: boolean
}

const Tile = function Tile({
  item,
  isInvalid,
  onRemove,
  isThumbnail,
}: TileProps) {
  const isFile = typeof item !== "string"

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-muted/30",
        isInvalid ? "border-destructive" : "border-border",
        // REVISI: Thumbnail dibuat full-width & dikunci tinggi maksimalnya (tanpa space kanan/kiri)
        isThumbnail ? "h-52 max-h-[350px] w-full sm:h-full" : "aspect-square"
      )}
    >
      {isFile ? (
        <MediaItem
          webViewLink={previewFor(item)}
          alt={item.name || "Preview Image"}
          className="size-full object-cover"
        />
      ) : (
        <MediaItem
          webViewLink={item}
          alt="Gambar paket"
          layout={isThumbnail ? "fullWidth" : "constrained"}
          width={isThumbnail ? 800 : 240}
          height={isThumbnail ? 450 : 240}
          objectFit="cover"
          className="size-full"
          imageClassName="size-full object-cover"
        />
      )}

      {isFile && (
        <span className="absolute bottom-2 left-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm">
          Siap diunggah
        </span>
      )}

      <Button
        type="button"
        aria-label="Hapus gambar"
        variant="destructive"

        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/90 p-0  focus:ring-2"
        onClick={() => onRemove(item)}
      >
        <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
      </Button>
    </div>
  )
}

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
        if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_BYTES)
          continue
        if (
          items.some(
            (it) =>
              it !== file &&
              it instanceof File &&
              it.name === file.name &&
              it.size === file.size
          )
        )
          continue
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
    <div
      className={cn(
        "flex w-full flex-col gap-3",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      {items.length > 0 && (
        <div
          className={cn(
            "grid gap-3",
            multiple ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1"
          )}
        >
          {items.map((item, index) => (
            <Tile
              key={itemKey(item, index)}
              item={item}
              isInvalid={isInvalid}
              onRemove={handleRemove}
              isThumbnail={!multiple}
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
            !isDragActive &&
              !isInvalid &&
              "border-border bg-background/40 hover:border-primary/50 hover:bg-muted/30"
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
            className={cn(
              "size-5",
              isInvalid ? "text-destructive" : "text-muted-foreground"
            )}
          />
          <p
            className={cn(
              "text-xs font-medium",
              isInvalid ? "text-destructive" : "text-foreground"
            )}
          >
            {isDragActive
              ? "Lepaskan gambar di sini"
              : "Letakkan gambar di sini, atau klik untuk memilih"}
          </p>
          <p
            className={cn(
              "text-[11px]",
              isInvalid ? "text-destructive/80" : "text-muted-foreground"
            )}
          >
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
