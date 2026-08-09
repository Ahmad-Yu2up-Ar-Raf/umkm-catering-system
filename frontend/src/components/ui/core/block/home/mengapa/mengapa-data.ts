/**
 * Mengapa Memilih Nusantara — 4 headline metrics, decoupled from the UI.
 *
 * Values are the project's APPROVED placeholder numbers from
 * `docs/HOMEPAGE_BUILD.md` §S5. Per design.md §11 gate 46 (honest copy),
 * these must be confirmed with the owner (or rendered as `—`) before launch.
 */

export interface MengapaMetric {
  /** Stable slug. */
  id: string
  /** Numeric target for the count-up animation. */
  value: number
  /** Suffix rendered after the number, e.g. "+", "%", or "" (year). */
  suffix: string
  /** Whether to apply the id-ID thousands grouping ("8.000"). Defaults true;
   *  disabled for plain values like the founding year (never "2.024"). */
  grouping?: boolean
  /** Small uppercase label under the number. */
  title: string
  /** One short line (≤ 7 words) under the label. */
  description: string
}

export const MENGAPA_METRICS: MengapaMetric[] = [
  {
    id: "tahun",
    value: 2024,
    suffix: "",
    grouping: false,
    title: "Tahun Kami Berdiri",
    description: "Dari dapur keluarga di Bogor, dimasak sepenuh hati.",
  },
  {
    id: "acara",
    value: 100,
    suffix: "+",
    title: "Acara Terlayani",
    description: "Resepsi, arisan, syukuran, hingga jamuan kantor.",
  },
  {
    id: "menu",
    value: 40,
    suffix: "+",
    title: "Pilihan Menu",
    description: "Nasi box, prasmanan, tumpeng, hingga snack box.",
  },
  {
    id: "rumahan",
    value: 100,
    suffix: "%",
    title: "Masakan Rumahan",
    description: "Bumbu autentik Nusantara tanpa serba instan.",
  },
]
