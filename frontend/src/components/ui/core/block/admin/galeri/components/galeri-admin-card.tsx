"use client"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Edit01Icon, Delete01Icon } from "@hugeicons/core-free-icons"
import { GalleryCard } from "@/components/ui/core/block/galeri/components/gallery-card"
import type { GalleryItem } from "@/components/ui/core/block/galeri/types/gallery-types"
import type { Galeri } from "@/components/ui/core/block/admin/galeri/types/galeri-types"

interface GaleriAdminCardProps {
  item: GalleryItem
  originalGaleri: Galeri
  index: number
  scope: GalleryItem[]
  onEdit: (galeri: Galeri) => void
  onDelete: (galeri: Galeri) => void
  isDeleting?: boolean
}

/**
 * Admin wrapper around the public GalleryCard.
 * Adds admin action buttons (Edit, Delete) on hover.
 * No "Pratinjau" button — clicking the card image already opens the modal.
 */
export function GaleriAdminCard({
  item,
  originalGaleri,
  index,
  scope,
  onEdit,
  onDelete,
  isDeleting = false,
}: GaleriAdminCardProps) {
  return (
    <div className="group relative overflow-hidden">
      <GalleryCard item={item} index={index} scope={scope} className="w-full" />
      {/* Admin actions overlay — appears on hover */}
      <div className="absolute right-0 bottom-0 left-0 flex h-full items-center content-center justify-center gap-2 rounded-2xl border-t border-border bg-foreground/95 p-2 px-6 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Button
          type="button"
          variant="default"
          size="lg"
          className="w-full flex-1 gap-1.5 bg-background hover:bg-secondary text-primary"
          onClick={() => onEdit(originalGaleri)}
        >
          <HugeiconsIcon icon={Edit01Icon} className=" size-4" />
          Ubah
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="lg"
          className="w-full flex-1 gap-1.5 bg-destructive text-background hover:bg-destructive/80"
          onClick={() => onDelete(originalGaleri)}
          disabled={isDeleting}
        >
          <HugeiconsIcon icon={Delete01Icon} className=" size-4" />
          Hapus
        </Button>
      </div>
    </div>
  )
}
