# Agent Ruleset — Catering Nusantara (untuk OpenCode)

> Instruksi ini adalah konteks wajib bagi AI coding agent sebelum menulis atau mengubah kode di repo ini. Baca juga `architecture.md` dan `design.md` untuk detail lengkap — dokumen ini hanya berisi aturan eksekusi.

---

## 1. Konteks Proyek (Ringkas)

Aplikasi katering hybrid: katalog publik (konversi ke WhatsApp) + Admin CMS/Mini POS internal. Monorepo dua bagian: `backend/` (Laravel) dan `frontend/` (React + Vite). Database: 4 tabel inti — `users`, `paket`, `galeri`, `pesanan` — lihat `architecture.md` untuk skema lengkap.

---

## 2. Aturan Struktur Monorepo

- Jangan pindahkan atau restrukturisasi folder `backend/` maupun `frontend/` tanpa instruksi eksplisit.
- Kode backend HANYA di `backend/`, kode frontend HANYA di `frontend/`. Jangan taruh logic bisnis di frontend yang seharusnya di backend (lihat aturan kalkulasi harga di bawah).
- Setiap fitur baru mengacu ke sitemap resmi di `architecture.md` §2 — jangan menambah halaman yang tidak ada di sitemap tanpa konfirmasi.

---

## 3. Aturan Kode Back-End (Laravel)

- **Autentikasi:** gunakan Laravel Breeze untuk scaffolding auth dasar, Sanctum untuk token API yang dikonsumsi frontend React (SPA auth pattern) — bukan session cookie lintas domain kecuali sudah dikonfirmasi arsitektur deploy-nya sama domain.
- **Validasi JSON:** field `menu_utama`, `menu_tambahan`, `fasilitas_termasuk` di tabel `paket`, dan `detail_tambahan` di `pesanan`, WAJIB divalidasi lewat Laravel Form Request — jangan terima array mentah tanpa validasi shape/tipe.
- **Kalkulasi `total_harga`:** WAJIB dihitung di server (service class atau model observer), TIDAK BOLEH menerima `total_harga` dari request body dan menyimpannya langsung. Formula: `(jumlah_paket * harga_paket_satuan) + biaya_tambahan`, dengan `harga_paket_satuan` disalin dari `paket.harga_per_porsi` pada saat pembuatan pesanan (bukan look-up ulang saat baca).
- **`nomor_struk`:** generate di server dengan format `STR-YYYYMMDD-XXXX`, jangan terima dari client.
- **Jangan membuat tabel/migrasi baru** di luar 4 tabel inti tanpa instruksi eksplisit — lihat `architecture.md` §4.3 untuk daftar tabel opsional yang BELUM disetujui untuk dibuat (`testimoni`, `faq`).
- **Paket per-unit khusus (Tumpeng Mini):** perhatikan bahwa beberapa paket dihargai per-paket (bukan per-porsi individual) — jangan asumsikan `harga_per_porsi` selalu = harga yang ditampilkan ke user tanpa mengecek `min_order` (lihat `architecture.md` §4.1).

---

## 4. Aturan Kode Front-End (React + Vite)

- **Komponen UI:** gunakan primitif dari **shadcn/ui** (berbasis Radix) sesuai peta komponen di `design.md` §6. Jangan bangun komponen custom dari nol jika padanannya sudah tersedia di shadcn/ui.
- **State management:** `zustand` HANYA untuk UI state lokal/global ringan (mis. status dialog, filter aktif) — BUKAN untuk data server (harga, daftar paket, riwayat pesanan).
- **Data server:** gunakan **Tanstack React Query** untuk semua fetch data dari backend (caching, invalidation), dikombinasikan dengan **Ky** sebagai HTTP client (bukan `fetch` mentah atau axios).
- **Routing:** gunakan **React Router** sesuai sitemap resmi di `architecture.md` §2 — termasuk halaman Tentang Kami, Cara Pemesanan, Kontak, FAQ yang statis kontennya tapi tetap butuh route sendiri.
- **Kalkulator Porsi & Sistem Hitung Otomatis (Admin):** tampilan real-time di frontend HANYA untuk UX (preview instan) — hasil akhir yang disimpan tetap harus melalui validasi ulang di server. Jangan pernah percaya angka dari frontend sebagai source of truth finansial.
- **Styling:** pakai token warna & font dari `design.md` §2-3 lewat Tailwind config. Jangan hardcode hex warna langsung di komponen.

---

## 5. Larangan Eksplisit

- ❌ Jangan ubah skema database (`architecture.md` §4) tanpa instruksi eksplisit dari tim.
- ❌ Jangan hitung/simpan `total_harga` di client-side sebagai nilai final.
- ❌ Jangan hardcode warna/font di luar token yang ditentukan di `design.md`.
- ❌ Jangan override file inti `components/ui/` (shadcn) secara langsung — re-theme lewat Tailwind config.
- ❌ Jangan tambah halaman/route di luar sitemap resmi tanpa konfirmasi.
- ❌ Jangan gunakan foto stok generik untuk konten produk jika aset foto asli klien tersedia (lihat `design.md` §5).

---

## 6. Referensi Silang

- Struktur data & alasan arsitektur → `architecture.md`
- Warna, font, komponen UI → `design.md`
- Ringkasan proyek & setup lokal → `README.md`
