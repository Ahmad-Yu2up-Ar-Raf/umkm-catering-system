import type { StrukPayload } from "@/components/ui/core/block/admin/pesanan/types/pesanan-types"

/**
 * Shared takumi-pdf render() options for invoice generation.
 *
 * IMPORTANT: `tagged: "ua1"` requests full PDF/UA-1 accessibility
 * conformance. PDF/UA-1 requires the document to declare a natural
 * language (`lang`) so assistive tech knows how to read the title /
 * outline. Without it, Takumi's writer rejects the file with
 * "validation failed with 1 error" — this was the root cause of the
 * "Struk" preview and "Download" both failing. Keep `lang` in sync
 * with the locale used for date/currency formatting (`id-ID`).
 */
export async function loadInvoiceFonts() {
  const { googleFonts } = await import("@takumi-rs/helpers")
  return googleFonts(["Space Grotesk", "Fraunces", "Instrument Serif"])
}

export function buildInvoiceRenderOptions(
  data: StrukPayload,
  fonts: Awaited<ReturnType<typeof loadInvoiceFonts>>
) {
  const nomorStruk = String(data?.nomor_struk ?? "-")

  return {
    size: "a4" as const,
    fonts,
    margin: { top: 48, bottom: 56, left: 48, right: 48 },
    pdfa: "3b" as const,
    tagged: "ua1" as const,
    metadata: {
      title: `Invoice ${nomorStruk}`,
      // Required for PDF/UA-1: declares the document's natural language.
      // Missing this is what produced "validation failed with 1 error".
      lang: "id",
      author: "Catering Nusantara",
      subject: `Struk pembelian ${nomorStruk}`,
      creationDate: new Date().toISOString().split("T")[0],
    },
  }
}
