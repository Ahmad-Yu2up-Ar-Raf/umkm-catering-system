"use client"

import { useGaleriDeleteMutation } from "../hooks/use-galeri-mutations"
import type { Galeri } from "../types/galeri-types"
import { useSidebar } from "@/components/ui/fragments/shadcn-ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { GaleriAdminCard } from "./galeri-admin-card"
import type { GalleryItem } from "@/components/ui/core/block/galeri/types/gallery-types"

/**
 * Map admin Galeri to public GalleryItem for reuse of GalleryCard.
 */
function toGalleryItem(galeri: Galeri): GalleryItem {
  const previewImage = galeri.thumbnail ?? galeri.gambar_acara ?? galeri.images?.[0] ?? ""
  return {
    id: String(galeri.id),
    category: galeri.kategori_acara as GalleryItem["category"],
    nama_acara: galeri.nama_acara,
    deskripsi_acara: galeri.deskripsi_acara ?? undefined,
    gambar_acara: previewImage,
    meta: {
      tanggal: galeri.tanggal_acara ?? undefined,
      venue: galeri.lokasi ?? undefined,
      jumlahTamu: galeri.jumlah_tamu ?? undefined,
    },
    is_featured: galeri.is_featured,
  }
}

interface GaleriCardGridProps {
  items: Galeri[]
  onEdit: (galeri: Galeri) => void
  onDelete: (galeri: Galeri) => void
}

/**
 * Admin card grid — reuses the public GalleryCard with admin actions overlaid.
 * Responsive column count matches PaketCardGrid: sidebar-aware xl/2xl.
 */
export function GaleriCardGrid({ items, onEdit, onDelete }: GaleriCardGridProps) {
  const isMobile = useIsMobile()
  const { open, openMobile } = useSidebar()
  const sidebarOpen = isMobile ? openMobile : open
  const { isPending: isDeleting, variables: deleteVariables } =
    useGaleriDeleteMutation()

  const galleryItems = items.map(toGalleryItem)

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
        sidebarOpen ? "xl:grid-cols-3" : "xl:grid-cols-4"
      )}
    >
      {galleryItems.map((galleryItem, idx) => {
        const originalGaleri = items[idx]
        const isThisDeleting = isDeleting && deleteVariables?.id === originalGaleri.id

        return (
          <GaleriAdminCard
            key={galleryItem.id}
            item={galleryItem}
            originalGaleri={originalGaleri}
            index={idx}
            scope={galleryItems}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isThisDeleting}
          />
        )
      })}
    </div>
  )
}