# Catering Nusantara — Web Platform

**Klien:** Dapur Bunda Catering, Bogor — berdiri sejak 2019 (PIC: Ratna Kusuma)
**Tim:** Ahmad Yusuf Ar-Rafi · Denniz Rizki Attila · Thoriq Azhar Raditya

> Platform F&B hybrid: katalog publik yang dioptimalkan untuk konversi ke WhatsApp, dipadukan dengan Admin CMS + Mini POS internal — di atas satu skema database yang diperkaya JSON.

Dokumentasi proyek ini dipecah menjadi beberapa file agar mudah dipahami manusia maupun AI coding agent:

| File | Isi |
|---|---|
| `README.md` (file ini) | Ringkasan proyek, tech stack, cara setup |
| [`architecture.md`](./architecture.md) | Sitemap, userflow, ERD, dan justifikasi arsitektur database |
| [`design.md`](./design.md) | Sistem desain "Down to Earth": warna, font, komponen UI |
| [`agent.md`](./agent.md) | Ruleset wajib untuk AI coding agent (OpenCode) sebelum menulis kode |

---

## 1. Ringkasan Proyek & Tech Stack

Sistem ini punya dua peran yang berbeda dari satu data model yang sama: **menjual** ke pengunjung publik anonim, dan **mengoperasikan** pipeline pesanan/invoice untuk admin internal. Lihat `architecture.md` untuk detail penuh sitemap dan userflow.

| Layer | Pilihan Teknologi |
|---|---|
| Back-End | **Laravel (PHP)**, **Breeze** (scaffolding auth), **Sanctum** (token API untuk SPA) |
| Front-End | **React + Vite**, **Shadcn/UI** (berbasis Radix), **Tailwind CSS**, **Zustand** (UI state), **Ky** (HTTP client), **Tanstack React Query** (server state), **React Router** |
| Database | **MySQL/MariaDB** — 4 tabel inti: `users`, `paket`, `galeri`, `pesanan` (lihat `architecture.md`) |

> Tech stack front-end diperluas signifikan pada revisi ini dibanding draft awal (semula hanya React + Tailwind + Vite polos) — lihat `agent.md` §4 untuk aturan pemakaian tiap library.

---

## 2. Cara Setup

### Prasyarat
- PHP ≥ 8.2, Composer
- Node.js ≥ 18, npm/yarn
- MySQL/MariaDB ≥ 8.0

### Back-End (Laravel)
```bash
git clone <repo-url> catering-nusantara
cd catering-nusantara/backend
composer install
cp .env.example .env
php artisan key:generate
# konfigurasi DB_* di .env
php artisan migrate --seed
php artisan install:api   # setup Sanctum
php artisan serve
```

### Front-End (React + Vite)
```bash
cd catering-nusantara/frontend
npm install
npx shadcn@latest init    # setup shadcn/ui + Tailwind
cp .env.example .env
# set VITE_API_BASE_URL ke URL backend Laravel
npm run dev
```

### Variabel Lingkungan (minimum)
| Variabel | Kegunaan |
|---|---|
| `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Koneksi MySQL |
| `APP_KEY` | Kunci enkripsi Laravel |
| `WHATSAPP_NUMBER` | Nomor tujuan deep-link checkout publik |
| `VITE_API_BASE_URL` | Base URL API untuk front-end |

---

## 3. Tautan Referensi

- Sitemap: [Relume project](https://www.relume.ai/app/project/P3496312_NPf8rfzVlwseLRNnLnOpo4Z32_-BkP4-kQ4NIDoJ_uU#mode=sitemap)
- ERD: [dbdiagram.io](https://dbdiagram.io/d/ERD-Sistem-Pendataan-Siswa-691d7e1e228c5bbc1a7f6b20)
- Userflow: [Mermaid](https://mermaid.ai/d/4951d72c-6112-4428-ba6f-690fe664705b) (sumber: `UMKM_Userflow.mmd`)
- Wireframe: [Figma Make](https://www.figma.com/make/ysaD60e2reJhGDHVtIKL8K/Website-Sitemap-and-Wireframe)
- Referensi desain visual: [suasana.vercel.app](https://suasana.vercel.app)

---

## 4. Kontributor

| Nama | Peran |
|---|---|
| Ahmad Yusuf Ar-Rafi | Back-End, Front-End |
| Denniz Rizki Attila | Back-End |
| Thoriq Azhar Raditya | Front-End |
