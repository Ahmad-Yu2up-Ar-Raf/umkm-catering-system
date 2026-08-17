import { GalleryBlock } from "@/components/ui/core/block/galeri/galeri-block"
import { useSeo } from "@/hooks/use-seo"

function GaleryPage() {
  useSeo({
    title: "Galeri Perayaan",
    description:
      "Galeri momen perayaan bersama Catering Nusantara — pernikahan, acara korporat, prasmanan, tumpeng, hingga hampers istimewa.",
    path: "/galeri",
  })

  return (
    <div className="mx-auto w-full">
      <GalleryBlock />
    </div>
  )
}

export default GaleryPage
