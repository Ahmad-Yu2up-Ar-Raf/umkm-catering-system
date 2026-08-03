# Content Brief — Tumpeng Mini (Detail Paket)

**Date:** 2026-08-01 · **Priority:** P1 · **Status:** DRAFT — needs client menu data & photos
**Target page:** Detail Paket — Tumpeng Mini (sitemap §2 no. 3.1, official route `/paket/:slug`)
**Intent:** Transactional / commercial
**Primary keywords:** tumpeng mini bogor, catering tumpeng bogor, tumpeng mini murah bogor, harga tumpeng mini bogor
**Authoritative source:** docs/architecture.md §4.1 (Tumpeng Mini priced PER PAKET, not per porsi)

---

## Why this page first
Tumpeng is the highest-opportunity gap in the landscape: no competitor owns
"catering tumpeng bogor" (only restaurants rank). Product is live at
**Rp250.000 per paket 10 porsi**. This page is the play to own the segment.

## HARD RULE — pricing semantics
- Display price as **"Rp250.000 / paket (10 porsi)"** — NEVER "Rp250.000 per porsi".
- Backend display uses `harga_per_porsi` = Rp25.000 with `min_order` = 10 (per-paket
  meaning lives in `min_order`, per docs/architecture.md §4.1). Keep the UI copy in sync.

## On-page SEO requirements
- **Title tag** (~60 chars): `Tumpeng Mini Bogor Rp250rb/paket | Catering Nusantara`
- **Meta description** (~155 chars): `Tumpeng Mini masakan rumah untuk ulang tahun,
  syukuran & arisan di Bogor. Mulai Rp250rb/paket (10 porsi). Antar ke [AREA].
  Pesan via WhatsApp.` *(confirm exact price before publish)*
- **H1:** `Tumpeng Mini Bogor — Nasi Tumpeng Masakan Rumah`
- **URL:** `/paket/tumpeng-mini`
- **Schema:** Product (price Rp250000, priceCurrency IDR, availability) + FAQPage
  (synced with FAQ page content).
- **Images:** 4+ real photos — full tumpeng, close-up lauk, packaging, delivery box.
  NO stock (frontend/docs/design.md §5). Placeholder until client photos arrive.

## Content outline (H2 structure)
1. **Hero + CTA** — tumpeng foto, price badge "Rp250rb / paket (10 porsi)", tombol
   WhatsApp (pre-filled message: "Halo Catering Nusantara, saya mau pesan Tumpeng Mini untuk
   [acara] tanggal [tanggal] di [area].")
2. **Kenapa Tumpeng Mini** — cocok untuk ulang tahun, syukuran, arisan, aqiqah kecil;
   tidak harus katering besar; hangat dan "masakan rumah".
3. **Isi Paket** — `[ISI MENU DARI SHEET DATA PRODUK — menu_utama/menu_tambahan]` +
   `[FASILITAS — fasilitas_termasuk, mis. piring/sendok, dll dari data sheet]`.
4. **Harga & Porsi** — tabel harga per paket (10 porsi) + opsi jumlah paket; capacity
   20–1000 porsi per acara; min order jelas (per paket).
5. **Area Pengantaran** — `[PENDING client delivery-area confirmation]`; biaya antar
   transparan (price transparency angle).
6. **Cara Pesan** — 4 langkah singkat (link ke Cara Pemesanan).
7. **FAQ** — "Berapa harga tumpeng mini di Bogor?", "1 paket untuk berapa orang?",
   "Bisa request menu khusus?", "H- berapa harus pesan?"
8. **Testimoni** — `[PENDING]`; jangan invent.

## Conversion requirements
- WhatsApp CTA above the fold AND after setiap section (wa.me, pre-filled message).
- No phone number hardcoded until client supplies it.

## Voice (frontend/docs/design.md "Down to Earth")
Warm, lokal, jujur. "Nasi tumpeng dengan lauk rumahan yang hangat — bukan katering
korporat yang kaku." Transparan soal harga, porsi, dan area antar. Bahasa Indonesia.

## Blocked on (client data request §7)
Menu & fasilitas sheet · photos · delivery areas · WhatsApp/NAP.
