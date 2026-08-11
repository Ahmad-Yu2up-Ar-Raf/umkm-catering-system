import {
  BalloonIcon,
  Building04Icon,
  ChefHatIcon,
  CookingPotIcon,
  Diamond01Icon,
  GiftIcon,
  LayoutGridIcon,
  PyramidIcon,
} from "@hugeicons/core-free-icons"

import type {
  GalleryCategory,
  GalleryCategoryId,
  GalleryItem,
} from "./types/gallery-types"

/**
 * Galeri Perayaan — static gallery data, decoupled from the UI.
 *
 * Every image resolves to a REAL asset under `frontend/public/assets/images`
 * (served at `/assets/images/...`) — no stock, no remote URLs (AGENTS §9).
 * Shape mirrors the future `GET /api/v1/galeri` `GaleriResource` (spec §4.4)
 * so the loader can be swapped to React Query + Ky without touching the
 * components. `meta` values are honest placeholders only (service-area venues
 * are real; dates/guest counts are intentionally omitted until real events
 * are captured — spec §6 gate: unverified meta renders as "—").
 */

export const AUTO_ADVANCE_MS = 6000

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  { id: "", label: "Semua", icon: LayoutGridIcon, description: "Semua momen perayaan" },
  { id: "pernikahan", label: "Pernikahan", icon: Diamond01Icon, description: "Resepsi yang anggun dan hangat" },
  { id: "korporat", label: "Korporat", icon: Building04Icon, description: "Gathering dan acara kantor" },
  { id: "prasmanan", label: "Prasmanan", icon: ChefHatIcon, description: "Sajian prasmanan lengkap" },
  { id: "tumpeng-syukuran", label: "Tumpeng & Syukuran", icon: PyramidIcon, description: "Tumpeng untuk syukuran" },
  { id: "perayaan", label: "Perayaan", icon: BalloonIcon, description: "Ulang tahun, arisan, dan lainnya" },
  { id: "hampers", label: "Hampers", icon: GiftIcon, description: "Bingkisan istimewa" },
  { id: "di-balik-dapur", label: "Di Balik Dapur", icon: CookingPotIcon, description: "Ketelatenan di dapur" },
]

export const GALLERY_ITEMS: GalleryItem[] = [
  // ── Pernikahan ────────────────────────────────────────────────────────────
  {
    id: "pernikahan-1",
    category: "pernikahan",
    nama_acara: "Resepsi pernikahan yang hangat",
    deskripsi_acara: "Resepsi pernikahan dengan tata meja elegan dan prasmanan khas Nusantara.",
    gambar_acara: "/assets/images/lifestyle/wedding-buffet-lifestyle-shot.png",
    meta: { venue: "Bogor" },
  },
  {
    id: "pernikahan-2",
    category: "pernikahan",
    nama_acara: "Prasmanan resepsi yang anggun",
    deskripsi_acara: "Sajian prasmanan resepsi nikahan yang tertata rapi untuk tamu undangan.",
    gambar_acara: "/assets/images/products/paket-prasmanan-nikahan/paket-prasmanan-nikahan-1.png",
    hover_gambar_acara: "/assets/images/products/paket-prasmanan-nikahan/paket-prasmanan-nikahan-2.png",
    meta: { venue: "Jakarta" },
  },
  {
    id: "pernikahan-3",
    category: "pernikahan",
    nama_acara: "Perjamuan panjang penuh kehangatan",
    deskripsi_acara: "Meja perjamuan panjang dengan hidangan tertata untuk keluarga dan sahabat.",
    gambar_acara: "/assets/images/products/paket-prasmanan-nikahan/paket-prasmanan-nikahan-3.png",
    meta: { venue: "Depok" },
  },

  // ── Korporat ──────────────────────────────────────────────────────────────
  {
    id: "korporat-1",
    category: "korporat",
    nama_acara: "Lunch box rapat dan training",
    deskripsi_acara: "Lunch box praktis untuk rapat, training, dan kegiatan kantor.",
    gambar_acara: "/assets/images/lifestyle/corporate-lunch-box-overhead-lifestyle.png",
    meta: { venue: "Bogor" },
  },
  {
    id: "korporat-2",
    category: "korporat",
    nama_acara: "Prasmanan acara kantor",
    deskripsi_acara: "Prasmanan gathering korporat yang berkelas dan mengenyangkan.",
    gambar_acara: "/assets/images/products/paket-prasmanan-korporat/paket-prasmanan-korporat-1.png",
    hover_gambar_acara: "/assets/images/products/paket-prasmanan-korporat/paket-prasmanan-korporat-2.png",
    meta: { venue: "Jakarta" },
  },
  {
    id: "korporat-3",
    category: "korporat",
    nama_acara: "Suasana gathering di kantor",
    deskripsi_acara: "Momen kebersamaan tim di tengah kesibukan kerja.",
    gambar_acara: "/assets/images/lifestyle/kantor-2.png",
    meta: {},
  },

  // ── Prasmanan ─────────────────────────────────────────────────────────────
  {
    id: "prasmanan-1",
    category: "prasmanan",
    nama_acara: "Sajian prasmanan lengkap",
    deskripsi_acara: "Prasmanan yang menggugah selera untuk berbagai acara.",
    gambar_acara: "/assets/images/products/paket-prasmanan-korporat/paket-prasmanan-korporat-2.png",
    meta: {},
  },
  {
    id: "prasmanan-2",
    category: "prasmanan",
    nama_acara: "Sajian prasmanan nikahan",
    deskripsi_acara: "Sentuhan akhir di setiap sajian untuk resepsi pernikahan.",
    gambar_acara: "/assets/images/products/paket-prasmanan-nikahan/paket-prasmanan-nikahan-3.png",
    meta: { venue: "Bekasi" },
  },

  // ── Tumpeng & Syukuran ────────────────────────────────────────────────────
  {
    id: "tumpeng-1",
    category: "tumpeng-syukuran",
    nama_acara: "Tumpeng syukuran keluarga",
    deskripsi_acara: "Tumpeng nasi kuning khas untuk momen syukuran keluarga.",
    gambar_acara: "/assets/images/products/paket-tumpeng/tumpeng-1.jpg",
    meta: { venue: "Bogor" },
  },
  {
    id: "tumpeng-2",
    category: "tumpeng-syukuran",
    nama_acara: "Tumpeng untuk perayaan syukuran",
    deskripsi_acara: "Hidangan tumpeng lengkap dengan lauk pauk pendamping.",
    gambar_acara: "/assets/images/products/paket-tumpeng/tumpeng-2.jpg",
    meta: {},
  },

  // ── Perayaan ──────────────────────────────────────────────────────────────
  {
    id: "perayaan-1",
    category: "perayaan",
    nama_acara: "Tumpeng mini ulang tahun",
    deskripsi_acara: "Tumpeng mini yang pas untuk merayakan hari istimewa.",
    gambar_acara: "/assets/images/products/paket-tumpeng-mini/tumpeng-mini-1.jpg",
    meta: { venue: "Jakarta" },
  },
  {
    id: "perayaan-2",
    category: "perayaan",
    nama_acara: "Perayaan kecil penuh warna",
    deskripsi_acara: "Momen perayaan bersama keluarga dan sahabat terdekat.",
    gambar_acara: "/assets/images/products/paket-tumpeng-mini/tumpeng-mini-2.jpg",
    meta: {},
  },

  // ── Hampers ───────────────────────────────────────────────────────────────
  {
    id: "hampers-1",
    category: "hampers",
    nama_acara: "Bingkisan istimewa untuk berbagi",
    deskripsi_acara: "Bingkisan istimewa yang siap dibagikan di momen spesial.",
    gambar_acara: "/assets/images/lifestyle/paket-combo-1.png",
    meta: {},
  },
  {
    id: "hampers-2",
    category: "hampers",
    nama_acara: "Snack box arisan",
    deskripsi_acara: "Snack box praktis dan manis untuk acara arisan.",
    gambar_acara: "/assets/images/products/paket-snack-box-arisan/paket-snack-box-arisan-1.png",
    meta: { venue: "Depok" },
  },
  {
    id: "hampers-3",
    category: "hampers",
    nama_acara: "Snack box untuk hadiah",
    deskripsi_acara: "Kemasan snack box yang cantik untuk diberikan sebagai hadiah.",
    gambar_acara: "/assets/images/products/paket-snack-box-arisan/paket-snack-box-arisan-2.png",
    meta: {},
  },

  // ── Di Balik Dapur ────────────────────────────────────────────────────────
  {
    id: "dapur-1",
    category: "di-balik-dapur",
    nama_acara: "Penyajian yang telaten",
    deskripsi_acara: "Ketelatenan tim dalam menyajikan setiap hidangan.",
    gambar_acara: "/assets/images/lifestyle/kantor-3.png",
    meta: {},
  },
  {
    id: "dapur-2",
    category: "di-balik-dapur",
    nama_acara: "Plating ayam bakar",
    deskripsi_acara: "Detail sentuhan akhir pada hidangan ayam bakar.",
    gambar_acara: "/assets/images/products/paket-gold-ayam-bakar/paket-gold-ayam-bakar-1.jpg",
    meta: {},
  },
  {
    id: "dapur-3",
    category: "di-balik-dapur",
    nama_acara: "Persiapan hidangan",
    deskripsi_acara: "Proses persiapan hidangan dengan bahan-bahan segar.",
    gambar_acara: "/assets/images/products/paket-gold-ayam-serundeng/paket-gold-ayam-serundeng-2.jpg",
    meta: {},
  },
]

/** One signature event per featured category, driving the hero crossfade. */
export const FEATURED_ITEMS: GalleryItem[] = [
  GALLERY_ITEMS.find((i) => i.id === "pernikahan-1")!,
  GALLERY_ITEMS.find((i) => i.id === "korporat-1")!,
  GALLERY_ITEMS.find((i) => i.id === "tumpeng-1")!,
  GALLERY_ITEMS.find((i) => i.id === "perayaan-1")!,
  GALLERY_ITEMS.find((i) => i.id === "hampers-1")!,
  GALLERY_ITEMS.find((i) => i.id === "dapur-1")!,
]

/** Category descriptor lookup by id ("" → "Semua"). */
export function getCategoryById(id: GalleryCategoryId): GalleryCategory {
  return (
    GALLERY_CATEGORIES.find((c) => c.id === id) ??
    GALLERY_CATEGORIES[0]
  )
}
