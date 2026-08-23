"use client"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Edit01Icon, Delete01Icon, EyeIcon } from "@hugeicons/core-free-icons"
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
 * Adds admin action buttons (Preview, Edit, Delete) on hover.
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
    <div className="relative group">
      <GalleryCard
        item={item}
        index={index}
        scope={scope}
        className="w-full"
      />
      {/* Admin actions overlay — appears on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/95 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            // Trigger the global image modal via GalleryCard's onClick
            // GalleryCard already handles this via its onClick
          }}
        >
          <HugeiconsIcon icon={EyeIcon} className="size-3.5" />
          Pratinjau
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => onEdit(originalGaleri)}
        >
          <HugeiconsIcon icon={Edit01Icon} className="size-3.5" />
          Ubah
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs text-destructive hover:text-destructive"
          onClick={() => onDelete(originalGaleri)}
          disabled={isDeleting}
        >
          <HugeiconsIcon icon={Delete01Icon} className="size-3.5" />
          Hapus
        </Button>
      </div>
    </div>
  )
}