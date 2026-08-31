// invoice-render-config.ts — DIAGNOSTIC VERSION, not for production
import type { StrukPayload } from "@/components/ui/core/block/admin/pesanan/types/pesanan-types"

export async function loadInvoiceFonts() {
  const { googleFonts } = await import("@takumi-rs/helpers")
  return googleFonts(["Space Grotesk", "Fraunces", "Instrument Serif"])
}

// NOTE: pdfa, tagged, and metadata are all removed on purpose.
// If this alone makes the PDF succeed, the crash is 100% coming from
// the pdfa/tagged/metadata combination, not the template or fonts —
// add them back one at a time (see Step 4) to find which one it is.
export function buildInvoiceRenderOptions(
  _data: StrukPayload,
  fonts: Awaited<ReturnType<typeof loadInvoiceFonts>>
) {
  return {
    size: "a4" as const,
    fonts,
    margin: { top: 48, bottom: 56, left: 48, right: 48 },
  }
}

