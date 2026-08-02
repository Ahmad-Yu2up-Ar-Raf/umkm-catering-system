# Content Brief — Snack Box (Detail Paket)

**Date:** 2026-08-01 · **Priority:** P2 · **Status:** DRAFT — needs client menu data & photos
**Target page:** Detail Paket — Snack Box (sitemap §2 no. 3.1, official route `/paket/:slug`)
**Intent:** Transactional
**Primary keywords:** snack box bogor, snack box murah bogor, snack kotak bogor, snack box kantor bogor, coffee break bogor
**Authoritative source:** docs/architecture.md §4 (Snack Box = lower end of price range, Rp18.000)

---

## Why this page
Snack box / coffee break coverage is thin across every competitor. Entry price point
**Rp18.000** (lowest in the range) makes it a volume/conversion product for rapat
kantor, arisan, ulang tahun. Secondary play: "coffee break bogor" for corporate.

## Pricing rule
- Display **Rp18.000 / porsi** (per-porsi product — min_order per paket/box from Data
  Produk sheet; confirm before publish). Do not invent min-order numbers.

## On-page SEO requirements
- **Title tag:** `Snack Box Bogor Mulai Rp18rb | Snack Kotak Kantor & Acara`
- **Meta description:** `Snack box masakan rumah di Bogor mulai Rp18rb — cocok untuk
  rapat, arisan & ulang tahun. Pilihan isi kotak [VARIASI]. Antar ke [AREA]. Pesan via WhatsApp.`
- **H1:** `Snack Box Bogor — Snack Kotak untuk Rapat & Acara`
- **URL:** `/paket/snack-box`
- **Schema:** Product (priceCurrency IDR) + FAQPage.
- **Images:** 3+ real photos (box varian, isi, packaging). NO stock (frontend/docs/design.md §5).

## Content outline (H2 structure)
1. **Hero + CTA** — foto snack box, badge "mulai Rp18rb", tombol WhatsApp (pre-filled:
   "Halo Dapur Bunda, saya mau pesan snack box [jumlah] untuk [acara] di [area].")
2. **Pilihan Snack Box** — `[VARIASI ISI DARI SHEET DATA PRODUK — snack kotak roti/kue,
   gorengan, buah, dll]`; untuk rapat, arisan, ulang tahun, seminar.
3. **Harga & Porsi** — tabel harga per varian; min order; capacity 20–1000 porsi.
4. **Area Pengantaran** — `[PENDING client delivery-area confirmation]`; biaya antar
   transparan.
5. **Cara Pesan** — 4 langkah (link Cara Pemesanan).
6. **FAQ** — "Snack box 1 box isi apa?", "Minimal order berapa?", "Bisa pesan H-1?",
   "Ada snack box untuk kantor bulanan?"
7. **Testimoni** — `[PENDING]`; jangan invent.

## Conversion requirements
- WhatsApp CTA di hero dan setelah setiap section.
- No phone number until client supplies it.

## Voice
Warm, lokal, jujur. Fokus "enak, praktis, tanpa ribet". Transparan harga & area.
Bahasa Indonesia.

## Blocked on (client data request §7)
Menu varian & min-order sheet · photos · delivery areas · WhatsApp/NAP.
