import { useParams } from "react-router"

import { GaleriCategoryBlock } from "@/components/ui/core/block/galeri/galeri-category-block"
import { getCategoryBySlug } from "@/components/ui/core/block/galeri/galeri-data"
import { useSeo } from "@/hooks/use-seo"

/**
 * /galeri/:kategori — a single category's gallery (deep-linkable slug).
 * SEO is category-aware; an unknown slug falls through to the block's
 * not-found state with generic metadata.
 */
function GaleriCategoryPage() {
  const { kategori = "" } = useParams()
  const category = getCategoryBySlug(kategori)
  const label = category?.label ?? "Galeri"

  useSeo({
    title: `Galeri ${label} — Catering Nusantara`,
    description: category
      ? `${category.description}. Lihat momen ${category.label} dari Catering Nusantara.`
      : "Galeri momen perayaan bersama Catering Nusantara.",
    path: `/galeri/${kategori}`,
  })

  return (
    <div className="mx-auto w-full">
      <GaleriCategoryBlock slug={kategori} />
    </div>
  )
}

export default GaleriCategoryPage