"use client"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"

/**
 * Paket detail API error — network/500 failures. Same editorial shell as the
 * not-found state, with a retry action. Terminal: chrome stays visible.
 */
export function DetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="container m-auto flex w-full flex-col items-center gap-6 px-6 py-28 text-center">
      <p className="text-[11px] tracking-[0.34em] text-primary uppercase">
        Katalog Paket
      </p>
      <h1 className="font-heading text-[clamp(36px,5vw,64px)] leading-tight font-light tracking-[-0.02em] text-foreground">
        Gagal memuat{" "}
        <span className="font-accent text-primary italic">paket</span>
      </h1>
      <p className="max-w-md text-muted-foreground">
        Terjadi kendala saat mengambil data paket. Silakan coba kembali.
      </p>
      <Button variant="outline" size="lg" onClick={onRetry}>
        Coba lagi
      </Button>
    </section>
  )
}
