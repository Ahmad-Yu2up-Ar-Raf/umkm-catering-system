/**
 * Pilihan Menu — static catalogue data decoupled from the UI.
 *
 * Items 01–05 mirror the packages seeded in `backend/docs/database-seeders.md`
 * (titles verbatim; descriptions tightened to one line). Items 06–07 are
 * Silver-series additions served from local product art. Every description is
 * ≤7 words so it renders on a single line at desktop widths.
 */

export interface MenuChoice {
  /** Stable package slug (used for the /kontak?paket= fallback query). */
  id: string
  /** Zero-padded index shown as the row numeral, e.g. "01". */
  index: string
  /** Package display name. */
  title: string
  /** Short, honest one-line description (≤7 words). */
  description: string
  /** Public asset path served from `/assets/...`. */
  imagePath: string
  /** Fallback contact route until the real /menu page ships. */
  href: string
}

const PACKET_QUERY = (id: string) => `/kontak?paket=${id}`

export const MENU_CHOICES: MenuChoice[] = [
  {
    id: "nasi-box-hemat",
    index: "01",
    title: "Nasi Box Hemat",
    description: "Praktis, ekonomis untuk kebutuhan kantor",
    imagePath:
      "/assets/images/products/paket-nasi-box-hemat/paket-nasi-box-hemat-1.png",
    href: PACKET_QUERY("nasi-box-hemat"),
  },
  {
    id: "prasmanan-pernikahan",
    index: "02",
    title: "Prasmanan Pernikahan",
    description: "Resepsi lengkap dengan penataan meja prasmanan",
    imagePath:
      "/assets/images/products/paket-prasmanan-nikahan/paket-prasmanan-nikahan-1.png",
    href: PACKET_QUERY("prasmanan-pernikahan"),
  },
  {
    id: "snack-box-arisan",
    index: "03",
    title: "Snack Box Arisan",
    description: "Empat kue basah segar untuk arisan",
    imagePath:
      "/assets/images/products/paket-snack-box-arisan/paket-snack-box-arisan-1.png",
    href: PACKET_QUERY("snack-box-arisan"),
  },
  {
    id: "tumpeng-mini",
    index: "04",
    title: "Tumpeng Mini",
    description: "Perayaan kecil yang tetap menarik",
    imagePath:
      "/assets/images/products/paket-tumpeng-mini/paket-tumpeng-mini-1.png",
    href: PACKET_QUERY("tumpeng-mini"),
  },
  {
    id: "prasmanan-korporat",
    index: "05",
    title: "Prasmanan Korporat",
    description: "Gathering formal dengan menu modern",
    imagePath:
      "/assets/images/products/paket-prasmanan-korporat/paket-prasmanan-korporat-2.png",
    href: PACKET_QUERY("prasmanan-korporat"),
  },
  {
    id: "silver-ayam-bakar",
    index: "06",
    title: "Silver Ayam Bakar",
    description: "Ayam bakar bumbu rumahan, harian istimewa",
    imagePath:
      "/assets/images/products/paket-silver-ayam-bakar/paket-silver-ayam-bakar-1.png",
    href: PACKET_QUERY("silver-ayam-bakar"),
  },
  {
    id: "silver-ayam-lada-hitam",
    index: "07",
    title: "Silver Ayam Lada Hitam",
    description: "Gurih sederhana, tetap terasa premium",
    imagePath:
      "/assets/images/products/paket-silver-ayam-lada-hitam/paket-silver-ayam-lada-hitam-1.jpg",
    href: PACKET_QUERY("silver-ayam-lada-hitam"),
  },
  {
    id: "premium-chicken-salted-egg",
    index: "08",
    title: "Premium Chicken Salted Egg",
    description: "Gurih sederhana, tetap terasa premium",
    imagePath:
      "/assets/images/products/paket-premium-chicken-salted-egg/paket-premium-chicken-salted-egg-1.jpg",
    href: PACKET_QUERY("paket-premium-chicken-salted-egg"),
  },
//   {
//     id: "paket-gold-chicken-pop",
//     index: "09",
//     title: "Silver Ayam Lada Hitam",
//     description: "Gurih sederhana, tetap terasa premium",
//     imagePath:
//       "/assets/images/products/paket-gold-chicken-pop/paket-gold-chicken-pop-1.jpg",
//     href: PACKET_QUERY("paket-gold-chicken-pop"),
//   },
]

export const AUTO_ADVANCE_MS = 6000
