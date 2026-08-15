"use client"

import { useNavigate } from "react-router"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"

/**
 * Paket not found — invalid id or HTTP 404. Mirrors the galeri-category
 * not-found shell (eyebrow → Fraunces H1 with accent italic word → sub →
 * escape-hatch button). A terminal page: chrome stays visible.
 */
export function DetailNotFound() {
  const navigate = useNavigate()

  return (
    <section className="container m-auto flex w-full flex-col items-center gap-6 px-6 py-28 text-center">
      <p className="text-[11px] tracking-[0.34em] text-primary uppercase">
        Katalog Paket
      </p>
      <h1 className="font-heading text-[clamp(36px,5vw,64px)] leading-tight font-light tracking-[-0.02em] text-foreground">
        Paket tidak{" "}
        <span className="font-accent text-primary italic">ditemukan</span>
      </h1>
      <p className="max-w-md text-muted-foreground">
        Paket yang Anda cari tidak tersedia. Jelajahi katalog kami sebagai
        gantinya.
      </p>
      <Button variant="outline" size="lg" onClick={() => navigate("/paket")}>
        Lihat katalog paket
      </Button>
    </section>
  )
}
