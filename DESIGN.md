# Design System — Catering Nusantara "Down to Earth"

> Panduan desain untuk developer dan AI coding agent. Tujuannya: setiap halaman terasa hangat, otentik, dan "melokal" — bukan template katering korporat generik.

---

## 1. Filosofi Desain

Brand ini bernama "Catering Nusantara" dan menjual rasa "masakan rumah". Dua prinsip ini harus terlihat, bukan cuma tertulis:

- **Melokal, bukan generik** — elemen visual mengacu ke budaya Nusantara: tekstur anyaman bambu, daun pisang, motif batik tipis sebagai aksen latar, bukan pola geometris korporat[cite: 6].
- **Homey, bukan kaku** — hindari kesan katering korporat yang dingin; sudut membulat, foto natural (bukan foto stok), tipografi hangat[cite: 6].

Referensi visual yang disepakati: **suasana.vercel.app** — tenang, estetik, menyatu dengan alam. Ambil kesan *ketenangannya* (palet warna berbasis OKLCH, transisi halus) tanpa meniru layout persis[cite: 6].

---

## 2. Palet Warna — "Earth Tones" (Tailwind v4 OKLCH)

Proyek ini menggunakan standar Tailwind CSS v4 dengan sistem warna **OKLCH** agar transisi warna lebih halus dan konsisten dengan vibe "Suasana". 

Konfigurasi warna tidak lagi menggunakan HEX di `tailwind.config.js`[cite: 6], melainkan di-set langsung melalui CSS variables pada file `index.css` menggunakan `@theme inline`.

- **Background & Foreground:** Menggunakan perpaduan warna yang bersih dengan kontras tinggi untuk *readability*[cite: 7].
- **Primary & Secondary:** Diarahkan pada *earth tones* yang hangat untuk tombol dan elemen interaktif[cite: 7].
- **Radius:** Sudut membulat di-set pada basis `0.625rem` (10px) agar UI terasa lebih ramah dan tidak kaku[cite: 7].

---

## 3. Tipografi

Proyek ini menggunakan kombinasi font dari Fontsource untuk memastikan *loading* yang optimal[cite: 7]:

| Peran | Font | Alasan / Penggunaan |
|---|---|---|
| Heading / Display | **Merriweather Variable** | Font serif ini memberikan kesan premium, klasik, dan hangat[cite: 7]. Digunakan khusus untuk judul halaman, nama paket katering, dan tagline. |
| Body / UI | **Figtree Variable** | Font sans-serif yang modern, bersih, dan sangat mudah dibaca[cite: 7]. Digunakan untuk seluruh teks deskripsi, harga, dan komponen UI Admin/POS. |

*Implementasi:* Diatur melalui variabel `--font-sans` dan `--font-heading` di CSS, serta dipanggil di lapisan `@layer base`[cite: 7].

---

## 4. Elemen Visual "Melokal"

Dipakai sebagai **aksen halus**, bukan elemen dominan — supaya tetap terasa clean seperti referensi suasana.vercel.app, bukan ramai[cite: 6]:

- **Tekstur anyaman bambu** — opsional sebagai background section tertentu, opacity rendah (~5-10%)[cite: 6].
- **Motif daun pisang / batik tipis** — digunakan secara minim sebagai divider atau border, tidak boleh mengganggu kontras teks[cite: 6].

---

## 5. Komponen UI — Shadcn/UI (Tailwind v4)

Gunakan **shadcn/ui** sebagai basis komponen[cite: 6]. Karena kita menggunakan Tailwind v4:
- JANGAN mencari atau membuat file `tailwind.config.js`.
- Semua kustomisasi desain (warna, border radius, font) dikontrol terpusat di `src/index.css`[cite: 7].
- Terdapat styling khusus untuk menghilangkan *outline* bawaan browser yang mengganggu dan menggantinya dengan `outline-ring/50` bawaan shadcn[cite: 7].