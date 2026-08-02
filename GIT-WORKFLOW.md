# Git Workflow Tim — Catering Nusantara

> Panduan ini WAJIB dibaca dan diikuti oleh seluruh anggota tim sebelum menulis kode.
> Tujuan: menghindari conflict, menjaga riwayat commit tetap bersih, dan memudahkan code review.

---

## Daftar Isi

1. [Struktur Branch](#1-struktur-branch)
2. [Aturan Naming Convention](#2-aturan-naming-convention)
3. [Daily Workflow (Step-by-Step)](#3-daily-workflow-step-by-step)
4. [Cara Commit yang Benar](#4-cara-commit-yang-benar)
5. [Cara Membuat Pull Request](#5-cara-membuat-pull-request)
6. [Cara Review & Merge PR](#6-cara-review--merge-pr)
7. [Cara Update Branch dengan Main](#7-cara-update-branch-dengan-main)
8. [Cara Handle Merge Conflict](#8-cara-handle-merge-conflict)
9. [Cheat Sheet Perintah Cepat](#9-cheat-sheet-perintah-cepat)

---

## 1. Struktur Branch

Kita pakai branch model sederhana:

```
main
  └── feat/nama-fitur        (branch fitur baru)
  └── fix/nama-bug           (branch perbaikan bug)
  └── chore/nama-tugas       (branch setup/refactor/docs)
```

| Branch | Fungsi | Siapa yang push |
|--------|--------|----------------|
| `main` | Kode production yang sudah stabil | **DILINDUNGI** — hanya lewat Pull Request & review |
| `feat/*` | Fitur baru | Masing-masing anggota |
| `fix/*` | Bugfix | Masing-masing anggota |
| `chore/*` | Setup, refactor, docs | Masing-masing anggota |

**Aturan penting:**
- `main` di-**protect** — tidak bisa push langsung. Harus lewat Pull Request.
- Setiap tugas (issue) 1 branch. Jangan buat 1 branch untuk 2 tugas berbeda.
- Hapus branch setelah di-merge ke main (biar nggak numpuk).

---

## 2. Aturan Naming Convention

### Branch Name

Format: `<type>/<nama-fitur-singkat>`

```
feat/api-paket-catalog
feat/halaman-katalog
fix/harga-kalkulasi-salah
chore/setup-tailwind-theme
chore/cleanup-route-lama
```

| Type | Kapan dipakai |
|------|--------------|
| `feat/` | Fitur baru (API, halaman baru, komponen baru) |
| `fix/` | Perbaiki bug (harga salah, data tidak muncul, error) |
| `chore/` | Setup project, refactor, update docs, bersih-bersih kode |

### Commit Message

Format: `<type>: <pesan singkat (bahasa Indonesia/Inggris)>`

```
feat: add API endpoint public catalog
feat: slicing halaman katalog paket
fix: perbaiki kalkulasi total harga di pesanan
fix: handle error ketika API timeout
chore: setup tailwind v4 theme tokens
chore: hapus controller proyek lama
```

Gunakan **type** yang sama seperti di branch name.

---

## 3. Daily Workflow (Step-by-Step)

Ini adalah langkah-langkah yang harus dilakukan SETIAP HARI oleh setiap anggota:

### Langkah 1: Ambil update terbaru dari main

```bash
# Pindah ke branch main
git checkout main

# Ambil semua update terbaru dari GitHub
git pull origin main
```

> **Catatan:** Selalu lakukan `git pull` di `main` DULU sebelum mulai ngoding.
> Ini biar branch lokal kamu selalu up-to-date dengan kode terbaru tim.

### Langkah 2: Buat branch baru untuk tugas hari ini

```bash
# Buat branch baru berdasarkan main (yang sudah di-pull)
git checkout -b feat/api-paket-catalog
```

> **Aturan:** 1 branch = 1 issue/tugas. Kalau kamu ngerjain 2 issue berbeda,
> buat 2 branch terpisah. Jangan campur-campur.

### Langkah 3: Kerjakan tugas (coding)

```bash
# Edit file, tambah kode, hapus kode, dll.
# Bisa pakai VS Code atau editor apapun
```

Selama coding, kalau mau nyimpen progress sementara:

```bash
# Cek file apa aja yang berubah
git status

# Lihat perubahan detail
git diff
```

### Langkah 4: Stage & Commit secara berkala

Jangan nunggu selesai semua baru commit. **Commit setiap kali selesai 1 bagian logis.**

```bash
# Stage file tertentu (rekomendasi: jangan git add . langsung)
git add app/Http/Controllers/PaketController.php
git add routes/api.php

# atau kalau filenya banyak dan sudah yakin aman:
git add .

# Commit dengan pesan jelas
git commit -m "feat: add PaketController with index and show methods"
```

**Kapan commit?** Setiap kali:
- Selesai buat 1 fungsi/ method
- Selesai buat 1 komponen React
- Selesai slicing 1 halaman
- Sebelum istirahat/makan
- Sebelum pulang

### Langkah 5: Push branch ke GitHub

```bash
# Push pertama (sekalian bikin branch di remote)
git push -u origin feat/api-paket-catalog

# Push berikutnya (sudah cukup)
git push
```

> Push pertama bakal error kalau belum pernah push branch ini sebelumnya.
> Makanya pake `git push -u origin namabranch` buat pertama kali.

### Langkah 6: Update branch dengan main (kalau ada perubahan)

Kalau pas lagi coding, tiba-tiba ada yang merge ke main:

```bash
# Ambil update main
git fetch origin main

# Gabungin update main ke branch kamu
git rebase origin/main

# atau alternatif pake merge:
# git merge origin/main
```

**Kenapa pake rebase?** Biar riwayat commit tetap rapi dan linear.
Tapi kalau belum yakin, pake `git merge origin/main` lebih aman.

### Langkah 7: Buat Pull Request (PR)

Setelah tugas selesai dan sudah di-push:

1. Buka https://github.com/Ahmad-Yu2up-Ar-Raf/umkm-catering-system
2. Klik tab **"Pull requests"** → klik **"New pull request"**
3. Pilih: `base: main` ← `compare: feat/api-paket-catalog`
4. Isi form PR (detail ada di section [Cara Membuat Pull Request](#5-cara-membuat-pull-request))
5. Klik **"Create pull request"**
6. Assign reviewer (minimal 1 orang)
7. Tempelin label: `backend`, `frontend`, atau `fullstack`

### Langkah 8: PR sudah di-merge? Hapus branch lokal

```bash
# Pindah ke main
git checkout main

# Pull update yang sudah di-merge
git pull origin main

# Hapus branch lokal (sudah tidak dipakai)
git branch -d feat/api-paket-catalog
```

---

## 4. Cara Commit yang Benar

### Format Commit

```
<type>: <pesan singkat>
```

| Type | Arti | Contoh |
|------|------|--------|
| `feat` | Fitur baru | `feat: add API paket catalog` |
| `fix` | Bugfix | `fix: kalkulasi total harga` |
| `chore` | Setup/deps/docs | `chore: setup tailwind v4` |
| `refactor` | Ubah kode tanpa ubah fungsi | `refactor: pindah logic ke service class` |
| `style` | Cuma format/rapihin | `style: format blade template` |

### Rules Commit

1. **Pisahkan** antara commit fitur dengan commit bugfix. Jangan dicampur.
2. **1 perubahan logis = 1 commit.** Jangan nunggu 10 file berubah baru commit.
3. **Jangan commit file .env, node_modules, atau vendor.** File-file ini sudah di `.gitignore`.
4. **Commit message singkat, padat, jelas.** Hindari pesan kayak "update", "fix", "nyoba".

---

## 5. Cara Membuat Pull Request

### Format Deskripsi PR

Buka tab **Pull requests** → **New pull request**, lalu isi:

```
## Deskripsi
[jelaskan secara singkat apa yang dikerjakan]

## Issue terkait
Closes #4

## Perubahan
- [x] Bersihkan routes/api.php dari controller lama
- [x] Tambah route publik GET /api/paket
- [x] Tambah route publik GET /api/paket/{id}

## Screenshot (kalau ada)
[attach screenshot]

## Checklist
- [ ] Kode sudah di-test manual
- [ ] Tidak ada console.log / debug code
- [ ] Udah pull latest main sebelum bikin PR
```

### Assign Reviewer

- Kalau PR **Backend** → assign ke **@DenizRizki** atau **@Ahmad-Yu2up-Ar-Raf**
- Kalau PR **Frontend** → assign ke **@ThoriqAR1301** atau **@Ahmad-Yu2up-Ar-Raf**
- Kalau PR **Fullstack** → assign ke **@Ahmad-Yu2up-Ar-Raf** minimal

### Label PR

Tempelin label yang sesuai:
- `backend` — untuk perubahan API / database / logic server
- `frontend` — untuk UI / komponen / styling
- `fullstack` — untuk integrasi backend-frontend
- `priority-critical` — urgent, harus segera di-review

---

## 6. Cara Review & Merge PR

### Bagi yang di-assign sebagai Reviewer:

1. Buka tab **Pull requests** di GitHub
2. Klik PR yang perlu di-review
3. Klik tab **"Files changed"** — lihat perubahan kode
4. Klik garis hijau/merah untuk kasih komentar (kalau ada yang perlu diperbaiki)
5. Kalau oke, klik **"Review changes"** → pilih **"Approve"**
6. Kalau ada yang salah, pilih **"Request changes"** dan kasih tau apa yang perlu diperbaiki
7. **Jangan merge sendiri** — biarkan yang buat PR yang merge

### Setelah di-approve (yang buat PR):

1. Klik tombol **"Merge pull request"**
2. Pilih **"Squash and merge"** (biar commit-nya digabung jadi 1 di main)
3. Klik **"Confirm merge"**
4. Klik **"Delete branch"** — hapus branch yang sudah tidak dipakai

---

## 7. Cara Update Branch dengan Main

Kalau branch kamu ketinggalan dari main (misalnya ada PR orang lain yang sudah di-merge duluan):

### Pakai Rebase (rekomendasi)

```bash
# Pastikan kamu di branch kamu sendiri
git checkout feat/api-paket-catalog

# Ambil update main
git fetch origin main

# Rebase branch kamu di atas main terbaru
git rebase origin/main

# Kalau ada conflict, selesaikan dulu (lihat section 8)
# Kalau udah selesai, force push
git push --force-with-lease
```

### Pakai Merge (alternatif yang lebih aman)

```bash
git checkout feat/api-paket-catalog
git fetch origin main
git merge origin/main
# Selesaikan conflict kalau ada
git push
```

> **Peringatan:** `git push --force` itu berbahaya. Selalu pake `--force-with-lease`
> yang lebih aman. Atau kalau ragu, pake `git merge` aja.

---

## 8. Cara Handle Merge Conflict

Conflict terjadi kalau 2 orang mengubah file yang sama di baris yang sama.

### Step-by-step:

```bash
# 1. Update branch kamu
git fetch origin main
git rebase origin/main

# 2. Git akan kasih tau file mana yang conflict
#    CONFLICT (content): Merge conflict in app/Http/Controllers/PaketController.php

# 3. Buka file yang conflict
#    Akan ada tanda:
#    <<<<<<< HEAD
#    kode kamu
#    =======
#    kode dari main
#    >>>>>>> main

# 4. Hapus tanda <<<<<<, ======, >>>>>>
#    Terus pilih kode mana yang benar (atau gabungin keduanya)

# 5. Stage file yang sudah diperbaiki
git add app/Http/Controllers/PaketController.php

# 6. Lanjutkan rebase
git rebase --continue

# 7. Kalau bingung atau mau batalin rebase:
git rebase --abort
```

**Tips kalau conflict:**
- Jangan panik. Conflict itu wajar, bukan bencana.
- Komunikasi sama temen yang juga ngubah file yang sama.
- Kalau bingung, panggil **@Ahmad-Yu2up-Ar-Raf** selaku Tech Lead.
- Alternatif: pake VS Code. Buka file yang conflict, akan ada opsi "Accept Current", "Accept Incoming", "Accept Both".

---

## 9. Cheat Sheet Perintah Cepat

### Setup Awal (cukup sekali)

```bash
git clone https://github.com/Ahmad-Yu2up-Ar-Raf/umkm-catering-system.git
cd umkm-catering-system
```

### Setiap Hari (wajib)

```bash
git checkout main
git pull origin main
git checkout -b feat/tugas-saya
# ...coding...
git add .
git commit -m "feat: selesai bikin fitur X"
git push -u origin feat/tugas-saya
```

### Commit & Push

```bash
git status                          # Cek file yang berubah
git diff                            # Lihat perubahan detail
git add namafile                    # Stage file tertentu
git add .                           # Stage semua file (hati-hati)
git commit -m "feat: pesan commit"  # Commit
git push                            # Push ke GitHub
```

### Branch

```bash
git branch                          # Lihat semua branch lokal
git branch -a                       # Lihat semua branch (termasuk remote)
git checkout namabranch             # Pindah branch
git checkout -b namabranch          # Buat + pindah branch baru
git branch -d namabranch            # Hapus branch lokal (aman)
git branch -D namabranch            # Hapus branch lokal (paksa)
```

### Update & Sync

```bash
git fetch origin main               # Ambil update main (tanpa merge)
git rebase origin/main              # Rebase branch ke main terbaru
git merge origin/main               # Merge main ke branch
git push --force-with-lease         # Push setelah rebase (AMAN)
git push --force                    # Push paksa (BERBAHAYA, jangan dipake)
```

### Pull Request (via CLI)

```bash
# Bikin PR dari terminal
gh pr create --base main --head feat/nama-branch --title "feat: judul PR" --body "deskripsi"
```

---

## Alur Visual Ringkas

```
main
  │
  ├── git pull (ambil update)
  │
  ├── git checkout -b feat/tugas-saya
  │
  ├── [CODING] → git add → git commit (ulang beberapa kali)
  │
  ├── git push -u origin feat/tugas-saya
  │
  ├── [BUKA GITHUB] → Create Pull Request → Assign Reviewer
  │
  ├── [REVIEWER] → Approve
  │
  ├── [MERGE] → Squash and merge → Delete branch
  │
  └── Kembali ke awal
```

---

## Referensi

- GitHub Issues & Project Board: https://github.com/users/Ahmad-Yu2up-Ar-Raf/projects/6
- Repositori: https://github.com/Ahmad-Yu2up-Ar-Raf/umkm-catering-system
- Panduan Git Resmi: https://git-scm.com/docs

---

*Dokumen ini bisa di-update sesuai kebutuhan tim. Kalau ada yang kurang jelas, tanya **@Ahmad-Yu2up-Ar-Raf**.*