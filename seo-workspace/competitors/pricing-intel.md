# Competitor Pricing Intel — Jakarta Nasi Box

> Generated: 2026-07-31 via Synergy Workflow (Tavily Discover → Scrapling Extract → Codebase-Memory Apply)
> Target market: Nasi Box / Katering Jakarta (Jabodetabek)

## Source Data

| Competitor | Domain | Position | Extraction Method |
|---|---|---|---|
| Rumah Tumpeng Jakarta | rumahtumpengjakarta.com/nasi-kotak2 | #1 SERP "katering nasi box kantor jakarta" | Scrapling `get` (HTTP, markdown) |
| Thyme Diner | thymediner.id/menus-catering | Premium tier | Scrapling `get` (HTTP, markdown) |

## Market Price Benchmark

### Economy tier — Rumah Tumpeng Jakarta (Rp19.000–36.000)

| Paket | Harga | Isi |
|---|---|---|
| Bento Basic | Rp19.000 | Nasi putih, ayam goreng, lalapan, sambal |
| Nasi Ekonomis B | Rp21.000 | Ayam goreng, lalapan tempe/tahu, sambal |
| Nasi Ekonomis C | Rp23.000 | Ayam goreng, tempe tahu goreng, lalapan, sambal |
| Nasi Kebuli Basic | Rp27.000 | Nasi kebuli + ayam goreng + acar |
| Nasi Kebuli Extra | Rp32.000 | Nasi kebuli + ayam kalasan + sambal goreng kentang |
| Bento Nasi Kuning Basic | Rp25.000 | Nasi kuning bento + ayam + mie goreng + telur rawis + orek |
| Bento Telur Merah | Rp28.000 | Nasi kuning/uduk + ayam + telur merah + mie + orek |
| Nasi Kuning Solo (best seller) | Rp36.000 | Ayam, telur rawis, sambal kentang ati, mie, orek, sambal |
| Tumpeng Mini (Tumini Basic) | ~Rp25.000 | Tumpeng mini porsi dewasa |
| Tumini Super Komplit | +Rp4.000 utk empal | Ayam, mie, telur balado, sambal kentang, urap |

**Kebijakan:** min order **10 porsi**, pesan dadakan **2 jam**, kirim **Jabodetabek 9 kota**, buka 07.00–21.00 setiap hari.

### Premium tier — Thyme Diner (Rp45.500–75.000/box)

| Paket | Harga | Isi |
|---|---|---|
| Menu Rinjani | Rp45.500 | Ayam bakar Taliwang, tempe goreng, plecing buncis, sambal |
| Menu Semeroe | ~Rp45.000 | Ayam goreng lengkuas, tempe bacem/telur balado, buncis jagung |
| Menu Slamet | ~Rp55.000 | Ayam goreng kremes, tempe goreng, urap |
| Menu Bali | Rp75.000 | Nasi daun jeruk, ayam bakar Taliwang, tahu crispy, plecing |
| Menu Express | ~Rp75.000 | Ayam goreng kalasan, empal suwir, orek tempe, buncis bakso |

**Kebijakan:** min order **25 pax** (daily/monthly), **free delivery min 100 pax**, add-on menu/buah, kemasan eksklusif.

## Gap Analysis (untuk Dapur Bunda Catering)

1. **Harga kompetitif:** Pasar Nasi Box Jakarta = Rp19.000–75.000. Ruang entry kompetitif Rp21.000–28.000 (bracket Bento Basic s.d. Bento Telur Merah).
2. **Best-seller pola:** Semua pesaing andalkan **Nasi Kuning Solo** / **Ayam Goreng Basic** sebagai menu unggulan — Dapur Bunda perlu menu signature serupa (is_best_seller).
3. **Gap premium:** Sedikit pemain di Rp45.000–75.000 tier "premium box" dengan kemasan estetik + sertifikat halal. Dapur Bunda bisa masuk di Rp35.000–45.000 dengan kemasan premium.
4. **Gap opsional:** Belum ada pemain yang menonjolkan "menu anak-anak (bento anak)" dalam SERP ini — sesuai proposal klien.
5. **Min order & dadakan:** Min 10 porsi + layanan dadakan 2 jam adalah standar pasar; kapasitas produksi Dapur Bunda (20–1000 porsi) harus diekspos di situs.

## Apply ke Codebase (via Codebase-Memory)

- **Status skema:** Graph menunjukkan `paket` migration/model/seeder **belum dibuat** (hanya users/cache/jobs/personal_access_tokens). DatabaseSeeder ada di `Back-End/database/seeders/DatabaseSeeder.php`.
- **Titik apply:** Buat migration `create_paket_table` + `Paket` model + `PaketSeeder` berisi data di atas (sesuai ARCHITECTURE.md §4 skema V3).
- **Aturan bisnis yang harus dijaga:**
  - Tumpeng Mini dihargai **per paket** → `harga_per_porsi` = harga ÷ 10, `min_order` = 10.
  - `menu_utama`/`menu_tambahan`/`fasilitas_termasuk` sebagai JSON.
  - `total_harga` dihitung server-side, jangan pernah terima dari client.
- **Catatan:** Membuat migrasi/tabel baru butuh persetujuan eksplisit (lihat AGENTS.md §5).
