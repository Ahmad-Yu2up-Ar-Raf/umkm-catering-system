import { InvoiceClassicDocument } from "./blocks/invoice-classic/invoice-classic"
import { minimalTheme } from "./theme-minimal"
import type { InvoiceClassicData } from "./blocks/invoice-classic/invoice-classic.types"
import {
  METODE_PEMBAYARAN_LABELS,
  type StrukPayload,
} from "@/components/ui/core/block/admin/pesanan/types/pesanan-types"

const COMPANY = {
  address: "Yogyakarta, Indonesia",
  email: "halo@cateringnusantara.id",
  logoPath: "/assets/logo/favicon-96x96.png",
  name: "Catering Nusantara",
  subtitle: "Katering & Layanan Acara",
} as const

const INVOICE_FONTS = ["Space Grotesk", "Fraunces", "Instrument Serif"] as const

const BANK_INFO =
  "Pembayaran via transfer — BCA 123456789 / Mandiri 987654321 a.n. Catering Nusantara. Mohon konfirmasi via WhatsApp setelah transfer."

function formatTanggal(dateStr: string | null | undefined): string {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Map the server struk payload to the pdfcn invoice block.
 * Totals are passed through untouched — total_harga from the server
 * is the financial source of truth, never recalculated client-side.
 */
export function strukToInvoiceClassicData(
  struk: StrukPayload,
  logo: string = COMPANY.logoPath
): InvoiceClassicData {
  const unitPrice = Number(struk.harga_paket_satuan ?? 0)
  const subtotal = struk.jumlah_paket * (Number.isFinite(unitPrice) ? unitPrice : 0)
  const biayaTambahan = Number(struk.biaya_tambahan ?? 0)
  const total = Number(struk.total_harga ?? 0)

  const nomorStruk = struk.nomor_struk ? String(struk.nomor_struk) : "-"
  const metode = struk.metode_pembayaran
    ? (METODE_PEMBAYARAN_LABELS[struk.metode_pembayaran] ?? struk.metode_pembayaran)
    : "-"

  const notes = [struk.catatan ? String(struk.catatan) : null, BANK_INFO]
    .filter(Boolean)
    .join("\n\n")

  return {
    billTo: {
      address: struk.alamat ? String(struk.alamat) : "-",
      name: String(struk.nama_pemesan ?? "-"),
      phone: String(struk.no_telepon ?? "-"),
    },
    companyAddress: COMPANY.address,
    companyEmail: COMPANY.email,
    companyName: COMPANY.name,
    dueDate: formatTanggal(struk.tanggal_acara ?? struk.created_at),
    extras: {
      detailTambahan: Array.isArray(struk.detail_tambahan)
        ? struk.detail_tambahan.map((x) => String(x ?? "-"))
        : [],
      menuTambahan: Array.isArray(struk.menu_tambahan)
        ? struk.menu_tambahan.map((x) => String(x ?? "-"))
        : [],
    },
    invoiceDate: formatTanggal(struk.created_at),
    invoiceNumber: nomorStruk,
    items: [
      {
        description: struk.paket ? String(struk.paket) : "-",
        quantity: struk.jumlah_paket ?? 0,
        unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
      },
    ],
    logo,
    notes,
    paymentTerms: {
      dueDate: formatTanggal(struk.tanggal_acara),
      method: metode,
      reference: `No. ${nomorStruk}`,
    },
    subtitle: COMPANY.subtitle,
    summary: {
      biayaTambahan: Number.isFinite(biayaTambahan) ? biayaTambahan : 0,
      subtotal: Number.isFinite(subtotal) ? subtotal : 0,
      total: Number.isFinite(total) ? total : 0,
    },
  }
}

export function strukPdfFilename(
  struk: StrukPayload,
  fallbackId: number | string
): string {
  const label = struk.nomor_struk
    ? String(struk.nomor_struk)
    : `pesanan-${fallbackId}`
  return `Invoice_CateringNusantara_${label}.pdf`
}

/* ------------------------------------------------------------------ *
 * Cached engine assets — fonts + logo are fetched ONCE per session,
 * never per click. Call warmInvoiceEngine() on mount of the order
 * page so the first preview/download feels instant.
 * ------------------------------------------------------------------ */

let cachedFonts: Promise<unknown> | null = null

function getFonts(): Promise<unknown> {
  cachedFonts ??= (async () => {
    const { googleFonts } = await import("@takumi-rs/helpers")
    return googleFonts([...INVOICE_FONTS])
  })()
  return cachedFonts
}

function absoluteLogoUrl(): string {
  return `${window.location.origin}${COMPANY.logoPath}`
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve(
        typeof reader.result === "string" ? reader.result : absoluteLogoUrl()
      )
    reader.onerror = () =>
      reject(reader.error ?? new Error("Gagal membaca logo."))
    reader.readAsDataURL(blob)
  })
}

let cachedLogo: Promise<string> | null = null

/**
 * Embed the logo as a data-URL so the PDF renderer never depends on
 * resolving a relative path in an isolated render context.
 * Falls back to an absolute URL if the fetch fails.
 */
function getLogoUrl(): Promise<string> {
  cachedLogo ??= (async () => {
    try {
      const res = await fetch(COMPANY.logoPath)
      if (!res.ok) throw new Error(`Logo HTTP ${res.status}`)
      return await readBlobAsDataUrl(await res.blob())
    } catch {
      return absoluteLogoUrl()
    }
  })()
  return cachedLogo
}

/** Pre-warm fonts, engine, and logo. Fire-and-forget on page mount. */
export function warmInvoiceEngine(): void {
  void getFonts()
  void import("takumi-pdf")
  void getLogoUrl().catch(() => undefined)
}

async function renderStrukPdfBlob(struk: StrukPayload): Promise<Blob> {
  // Fonts/logo/engine resolve from session cache after warm-up —
  // the only per-click cost is the struk fetch (caller) + render itself.
  const [{ render }, fonts, logo] = await Promise.all([
    import("takumi-pdf"),
    getFonts(),
    getLogoUrl(),
  ])
  const bytes = await render(
    InvoiceClassicDocument({
      data: strukToInvoiceClassicData(struk, logo),
      theme: minimalTheme,
    }) as unknown as Parameters<typeof render>[0],
    {
      fonts,
      // Zero engine margin: the Page div below owns the full sheet and
      // paints the brand background edge-to-edge. Any margin here is an
      // unpainted white frame that double-insets the content.
      margin: { bottom: 0, left: 0, right: 0, top: 0 },
      size: "a4" as const,
    } as Parameters<typeof render>[1]
  )
  return new Blob([bytes as unknown as ArrayBuffer], {
    type: "application/pdf",
  })
}

/**
 * Native full-screen preview: render to a Blob URL and open it in a new
 * browser tab, leveraging the browser's built-in PDF viewer.
 * The tab is opened synchronously to survive popup blockers.
 */
export async function previewStrukInNewTab(struk: StrukPayload): Promise<void> {
  const tab = window.open("", "_blank")
  try {
    const blob = await renderStrukPdfBlob(struk)
    const url = URL.createObjectURL(blob)
    // Revoke late — the new tab needs time to fetch the blob.
    setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000)
    if (tab) {
      tab.location.href = url
    } else {
      window.open(url, "_blank")
    }
  } catch (e) {
    tab?.close()
    throw e
  }
}

export async function downloadStrukPdf(
  struk: StrukPayload,
  fallbackId: number | string
): Promise<void> {
  const blob = await renderStrukPdfBlob(struk)
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = strukPdfFilename(struk, fallbackId)
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
