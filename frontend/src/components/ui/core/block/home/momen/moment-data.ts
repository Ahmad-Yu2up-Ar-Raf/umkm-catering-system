/**
 * Momen Yang Kami Rayakan — static gallery data, decoupled from the UI.
 *
 * Dummy set built from REAL client assets already in `public/assets/images`
 * (no stock, no new uploads). Shape mirrors the future `GET /galeri`
 * endpoint (`../backend/docs/api-collection.md`) so the loader can be swapped
 * to React Query + Ky later without touching the components.
 */

export interface MomentItem {
  /** Stable slug, e.g. "pernikahan-1". */
  id: string
  /** Category micro-label, e.g. "Pernikahan" | "Korporat" | "Syukuran". */
  category: string
  /** One-line caption (featured) / two-line max (marquee tiles). */
  title: string
  /** Public asset path served from `/assets/...`. */
  imagePath: string
}

export const AUTO_ADVANCE_MS = 6000

export const MOMENT_ITEMS: MomentItem[] = [
  {
    id: "pernikahan-1",
    category: "Pernikahan",
    title: "Resepsi pernikahan yang hangat",
    imagePath: "/assets/images/lifestyle/wedding-buffet-lifestyle-shot.png",
  },
  {
    id: "pernikahan-2",
    category: "Pernikahan",
    title: "Prasmanan penuh kehangatan",
    imagePath:
      "/assets/images/products/ai-generated/paket-prasmanan-nikahan/paket-prasmanan-nikahan-1.png",
  },
  {
    id: "korporat-1",
    category: "Korporat",
    title: "Lunch box rapat dan training",
    imagePath:
      "/assets/images/lifestyle/corporate-lunch-box-overhead-lifestyle.png",
  },
  {
    id: "korporat-2",
    category: "Korporat",
    title: "Prasmanan acara kantor",
    imagePath:
      "/assets/images/products/ai-generated/paket-prasmanan-korporat/paket-prasmanan-korporat-1.png",
  },
  {
    id: "syukuran-1",
    category: "Syukuran",
    title: "Tumpeng syukuran keluarga",
    imagePath: "/assets/images/products/tumpeng/tumpeng-1.jpg",
  },
  {
    id: "syukuran-2",
    category: "Syukuran",
    title: "Tumpeng mini ulang tahun",
    imagePath: "/assets/images/products/tumpeng-mini/tumpeng-mini-1.jpg",
  },
  {
    id: "hampers-1",
    category: "Hampers",
    title: "Bingkisan istimewa untuk berbagi",
    imagePath: "/assets/images/products/ai-generated/paket-combo-1.png",
  },
  {
    id: "di-balik-layar-1",
    category: "Di Balik Layar",
    title: "Penyajian yang telaten",
    imagePath: "/assets/images/products/ai-generated/kantor-3.png",
  },
]
