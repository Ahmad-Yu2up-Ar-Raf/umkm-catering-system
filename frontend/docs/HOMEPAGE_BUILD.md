# HOMEPAGE_BUILD.md — V2 Master Blueprint (Catering Nusantara)

**Status:** V2 — APPROVED · Pre-Build Planning complete
**Language mandate:** ALL user-facing copy, structural copywriting, and dummy data in elegant **Bahasa Indonesia**.
**Aesthetic mandate:** warm, local, down-to-earth culinary — never a sterile SaaS dashboard.

---

## 0. ⚠ Pre-Build Blocker (read before coding)

`node_modules/typescript` + `node_modules/eslint` are truncated (from interrupted installs). **First build action:** restore `typescript@6.0.3` (from sibling `gurun` pnpm store) + `eslint`, re-verify `npm run typecheck && npm run lint && npm run lint:design` green. Then sync assets (Section 6) before writing any component.

## 0.1 Data Usaha Resmi (hardcoded truth — do not invent contact details)

| Field          | Value                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Nama Usaha     | Catering Nusantara · Pemilik: **Eva Rudianti** · Berdiri: **2024**                                       |
| Alamat         | Jln. Kapten Yusuf gang Purnama, Taman Sari, Bogor <!-- TODO: sub-district pending owner verification --> |
| Kontak (HP/WA) | 08561155113 → `https://wa.me/6287870306031`                                                              |
| Email          | Waroengpecelayam99@gmail.com                                                                             |

---

## 1. Design Constraints Locked In

- **Tokens:** OKLCH warm cream `bg-background`, earthy amber/brown `bg-primary`, warm sand `bg-secondary`, warm dark brown `text-foreground`, cream cards — from `src/index.css`. Light + `.dark`. **No hex/fonts in components.**
- **Fonts:** Fraunces Variable (headings) · Space Grotesk Variable (body) · Instrument Serif (`--font-accent` italic accent). Fixed.
- **Taste dials:** VARIANCE 5 · MOTION 4 · DENSITY 3 — local `catering-nusantara-design` loads BEFORE global `design-taste-frontend`.
- **Anti-slop:** no purple gradients, no card-in-card, no Inter, no gray-on-colored, no bounce easing, no 3-equal-card grids, no emoji icons (HugeIcons only).
- **Corner language:** controls `rounded-lg` (base radius); **food imagery `rounded-2xl`** (soft, warm — never sharp/brutalist).
- **Texture rule:** kraft/batik always as `opacity-5` background layer over `bg-background` — never above content, never reducing contrast.

---

## 2. Tiska Paradigm — Deconstructed Structural Flow (verified research)

`Pill nav → HERO (word-mask + italic accent) → Featured service (split) → Philosophy (stacked headline + image pair) → Stats (01–04 count-up) → Logo marquee → History timeline → Services (horizontal scroll, numbered) → Custom CTA → Portfolio → FAQ (sticky sub-nav) → Footer`

**Cohesion rules:** every section structurally distinct; bound by one serif + one italic accent word per headline, one token family, one rounded-card treatment, one motion grammar. Premium density = `clamp(34px,7vw,84px)` light display type, tight `leading-1.05`, uppercase letter-spaced eyebrows, gradient hairline dividers. Every section ends in a conversion CTA.

---

## 3. Section-by-Section Blueprint (exact spacing & tokens)

> Global container: `mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8`. Sections stack in a `flex flex-col gap-12 lg:gap-20`. Eyebrow: `text-[11px] uppercase tracking-[0.5em] text-primary`. H2: `font-heading text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] text-foreground`. Body: `text-base md:text-lg leading-relaxed text-muted-foreground max-w-2xl`.

### S1 — Hero "Cita Rasa Rumah"

- **Layout:** full-bleed `/assets/images/banners/hero-banner-tumpeng.png` (`object-cover`, min-h `min-h-[92svh]`), cream overlay `bg-gradient-to-b from-background/60 via-background/25 to-background`, centered column `flex flex-col items-center justify-center gap-6 text-center`.
- **Copy:** eyebrow `KATERING NUSANTARA · MASAKAN RUMAH SEJATI` · H1 `Cita Rasa *Rumahan* untuk Perayaan Istimewa Anda` (italic `font-accent` on _Rumahan_) · sub `Masakan rumahan yang hangat dan konsisten — untuk resepsi, arisan, hingga jamuan kantor di Bogor, Jakarta, dan sekitarnya.` · CTAs `Jelajahi Menu →` (primary, `rounded-lg px-7 py-3`) + `Konsultasi Gratis di WhatsApp` (outline) · scroll cue `Jelajahi ↓`.
- **Motion:** curtain preloader (only full-screen effect); bg parallax `yPercent` −8→8 scrub; word-mask stagger 0.06s `power3.out` 0.9s; eyebrow/CTA opacity 0.3s delayed.
- **Micro:** buttons press `scale-98` 150ms; focus `ring-2 ring-ring`.

### S2 — Filosofi Rasa (About — founder)

- **Layout:** `grid lg:grid-cols-2 gap-8 lg:gap-16 items-center`; left copy column (`gap-6`), right paired images (offset: second image `mt-8 lg:-mt-16 ml-auto`, each `rounded-2xl shadow-md object-cover aspect-[4/3]`).
- **Copy:** eyebrow `FILOSOFI RASA` · H2 `Setiap perayaan adalah *kisah* Anda.` · body `Sejak 2024, Catering Nusantara hadir dari dapur keluarga kami di Bogor, dipimpin langsung oleh Eva Rudianti. Kami percaya hidangan terbaik bukan yang paling megah, melainkan yang membuat tamu merasa diistimewakan — dimasak dengan telaten, disajikan dengan hati, seperti masakan rumah untuk orang terdekat Anda.` · CTA `Kenali Kami →`.
- **Assets:** `/assets/images/lifestyle/wedding-buffet-lifestyle-shot.png` + `/assets/images/lifestyle/corporate-lunch-box-overhead-lifestyle.png`.

### S3 — Kategori Menu

- **Layout:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`; card = `group rounded-2xl overflow-hidden bg-card border border-border shadow-sm` → image `aspect-[4/3] object-cover transition-transform duration-500 ease-out group-hover:scale-105`, content `p-6` (`gap-3`).
- **Copy:** H2 `Satu standar rasa, *banyak* pilihan.` · cards Tumpeng & Syukuran / Prasmanan / Nasi Box & Snack Box / Hampers & Paket Spesial · caption per card · `Lihat Paket →`.
- **Assets:** `/assets/products/tumpeng/tumpeng-1.jpg` · `/assets/products/ai/paket-prasmanan-nikahan.png` · `/assets/products/ai/paket-nasi-box-hemat.png` · `/assets/products/ai/paket-snack-box-arisan.png`.

### S4 — Menu Unggulan (server data)

- **Layout:** horizontal scroll on mobile, `grid lg:grid-cols-3 gap-8` on desktop; `PackageCard` = `rounded-2xl bg-card border border-border shadow-sm overflow-hidden` → image `aspect-[4/3] object-cover` + `p-6 md:p-8` (`flex flex-col gap-4`): name (`font-heading text-2xl`), `menu_utama` list (`text-sm text-muted-foreground`), price `Mulai Rp … text-primary font-semibold` + `/porsi` or `/paket` (respect `min_order`), `Badge` for min-order note, CTA `Pesan via WhatsApp →`.
- **Hover:** image `scale(1.05)` **400ms ease-out**; `shadow-sm → shadow-lg` (Suasana warm-tinted); `border-border → border-primary/40`; arrow translateX `4px` 200ms.
- **Loading:** `Skeleton` grid (3 cards) · Empty: `Belum ada paket — hubungi kami.`

### S5 — Mengapa Kami (stats)

- **Layout:** `grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center`; each = eyebrow-style number `font-heading text-5xl font-light text-primary` + label `text-sm uppercase tracking-widest text-muted-foreground`.
- **Copy:** H2 `Dibangun dengan *sepenuh hati*` · stats `2024 Tahun kami berdiri · 100+ Acara terlayani · 40+ Pilihan menu · 100% Masakan rumahan`.
- **Motion:** count-up, GSAP `snap` + `power2.out`, trigger at 30% into view, once.

### S6 — Testimoni & Klien

- **Layout:** quotes `grid lg:grid-cols-3 gap-8`; card = `rounded-2xl bg-card border border-border p-8 flex flex-col gap-4 shadow-sm`, quote `text-lg leading-relaxed`, name `text-sm font-semibold text-primary`; marquee band below (`overflow-hidden` rail, `py-10`).
- **Copy:** H2 `Dipercaya untuk *momen* istimewa` · 3 testimonials (final copy below) · band `BANK · BUMN · KORPORAT · SEKOLAH · INSTANSI`.
  - **1 — Pernikahan (Ibu Eva thanked):** "Untuk pernikahan anak kami, Catering Nusantara menyiapkan prasmanan 300 porsi — dan semua tamu memuji rasanya yang seperti masakan rumah, tapi penyajiannya rapi dan terasa premium. Yang paling kami ingat, Ibu Eva sendiri yang mengawasi dari pagi sampai acara selesai dan memastikan makanan selalu hangat. Terima kasih banyak, Ibu Eva, pelayanannya benar-benar luar biasa. Kami pasti pesan lagi untuk acara aqiqah nanti." — **Bu Sri Rahayu**, orang tua pengantin, Bogor Timur
  - **2 — Nasi box kantor:** "Kantor kami rutin memesan nasi box untuk rapat dan training. Yang membedakan Catering Nusantara dari katering lain, ayamnya benar-benar berasa bumbu rumahan yang khas — bukan rasa katering yang itu-itu saja. Pesanan 120 box tiba tepat waktu, porsinya pas, dan harganya masuk akal. Karyawan sampai bertanya-tanya langganan catering mana ini. Kini sudah jadi langganan tetap kantor kami." — **Dimas Prasetyo**, HR Manager, kantor di Sentul
  - **3 — Tumpeng Mini (ulang tahun):** "Untuk ulang tahun adik saya, kami memesan Tumpeng Mini dari Catering Nusantara. Tumpengnya cantik dan lauknya lengkap — ayam goreng, sambal, dan urap yang segar. Meski namanya 'mini', kualitasnya tidak mini sama sekali: rasanya premium namun tetap otentik khas masakan Nusantara. Anak-anak sampai rebutan nasi kuningnya! Pasti pesan lagi untuk acara keluarga berikutnya." — **Maya Anggraini**, warga Cibinong
- **Motion:** fade-up 0.5s stagger 0.1s once; marquee CSS `@keyframes` 30s linear infinite, `animation-play-state: paused` on hover.

### S7 — Cara Pesan (contact)

- **Layout:** 3-step `grid md:grid-cols-3 gap-8 lg:gap-12` with connecting gradient hairline; each step = number `font-heading text-4xl text-primary/70` + title (`font-heading text-xl`) + body.
- **Copy:** `01 Pilih Paket` · `02 Konsultasi via WhatsApp` — hubungi **0856 1155 113** · `03 Acara Anda Berjalan` · CTA `Mulai Konsultasi →`.

### S8 — High-End CTA (contact)

- **Layout:** full-width band `bg-background` + kraft texture overlay `opacity-5` (`before:` layer), centered `gap-6 py-24`; H2 word-mask + primary button.
- **Copy:** H2 `Setiap acara punya *rasa* yang berbeda.` · sub `Ceritakan perayaan Anda — kami rancang menu yang paling pas. Hubungi Eva Rudianti di 0856 1155 113.` · CTA `Chat WhatsApp Sekarang`.
- **Assets:** `/assets/images/textures/kraft-paper-box-macro-texture.png` (opacity-5) · optional `/assets/images/textures/gunung-wayang.png`.

### S9 — Footer

- **Layout:** `border-t border-border bg-card/40`; `grid gap-8 md:grid-cols-3`, logo + tagline, nav, contact block (`space-y-2`, `text-sm text-muted-foreground`).
- **Contact (verbatim):** Catering Nusantara · Pemilik: Eva Rudianti · Sejak 2024 · Jln. Kapten Yusuf gang Purnama, Taman Sari, Bogor · Telp/WA: 0856 1155 113 · Email: Waroengpecelayam99@gmail.com · © 2026. <!-- TODO: address sub-district pending owner verification -->

---

## 4. Component & Token Matrix (exact classes)

| Component                                          | Build from             | Exact token usage                                                                                                                             |
| -------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `PillHeader`                                       | custom                 | fixed, `rounded-full border`, scroll → `bg-card/90 backdrop-blur`, `transition-[top,padding,background-color] duration-500`                   |
| `WordReveal`                                       | custom (GSAP)          | word spans, inner `translateY(110%)` → 0                                                                                                      |
| `SectionEyebrow`                                   | custom                 | `text-[11px] uppercase tracking-[0.5em] text-primary` + gradient hairline `h-px bg-gradient-to-r from-transparent via-primary to-transparent` |
| `WhatsAppButton`                                   | `Button`               | primary; link to `https://wa.me/6287870306031`                                                                                                |
| `PackageCard` / `CategoryCard` / `TestimonialCard` | `Card` + `CardContent` | `rounded-2xl bg-card border-border shadow-sm p-6 md:p-8`                                                                                      |
| `SmartImage`                                       | custom                 | `object-cover aspect-[4/3] rounded-2xl`, lazy, hover `scale-105 duration-500 ease-out`                                                        |
| `CountUp`                                          | custom (GSAP)          | —                                                                                                                                             |
| `Marquee`                                          | custom (CSS)           | rail `overflow-hidden`, track `flex w-max gap-8 animate-marquee`                                                                              |
| Loading / Empty                                    | `Skeleton`, `Card`     | `Skeleton h-64 rounded-2xl`                                                                                                                   |
| Layout wrappers                                    | `Section`/`Container`  | `flex flex-col gap-12 lg:gap-20`, `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8`                                                                    |

**Composition:** `src/pages/home-page.tsx` → `src/components/ui/core/block/home/*` (hero, about, kategori, unggulan, mengapa, testimoni, cara-pesan, cta) + `src/components/motion/*`. Server data via React Query + Ky only.

---

## 5. Motion & Micro-Interaction Spec (exact, 60fps)

| Moment            | Tween                                                            | Easing         | Duration            | Trigger                  |
| ----------------- | ---------------------------------------------------------------- | -------------- | ------------------- | ------------------------ |
| Preloader curtain | overlay `translateY(0→-100%)`                                    | `expo.inOut`   | 1.0s                | on mount, once           |
| Hero bg parallax  | `yPercent −8→8`                                                  | scrub          | —                   | ScrollTrigger scroll     |
| Hero word-mask    | words `translateY(110%→0)`                                       | `power3.out`   | 0.9s, stagger 0.06s | on mount (after curtain) |
| Eyebrow / CTA     | opacity 0→1                                                      | `power1.out`   | 0.3s, delay 0.2s    | on mount                 |
| Section header    | word-mask + divider `scaleX 0→1`                                 | `power2.inOut` | 1.2s                | ScrollTrigger once @75%  |
| Category cards    | `y:24, opacity:0→1`                                              | `power3.out`   | 0.6s, stagger 0.08s | once                     |
| **Card hover**    | image `scale→1.05` + `shadow-sm→shadow-lg` + `border→primary/40` | `ease-out`     | **400ms**           | CSS hover                |
| CTA arrow         | `translateX 0→4px`                                               | `power2.out`   | 200ms               | hover                    |
| Buttons press     | `scale 1→0.98`                                                   | `power1.out`   | 150ms               | active                   |
| Count-up          | number snap                                                      | `power2.out`   | 1.2s                | once @30%                |
| Testimonials      | `y:16, opacity:0→1`                                              | `power2.out`   | 0.5s, stagger 0.1s  | once                     |
| Marquee           | translateX −50% loop                                             | `linear`       | 30s infinite        | CSS, pause on hover      |
| Steps divider     | `scaleX 0→1` per step                                            | `power2.inOut` | 0.8s                | once per step            |
| CTA button pulse  | one `scale 1→1.03→1`                                             | `power1.out`   | 400ms               | once on in-view          |

**Global rules:** transforms only (never width/height); rAF pause on `document.hidden`; every ScrollTrigger `once:true` unless scrub; all gated by `use-reduced-motion` (`prefers-reduced-motion` → static render). Code execution completed — verify visually in the browser.

---

## 6. Asset Requisition & Absolute Pathing

**Canonical store:** `frontend/public/assets/` is the single source of truth AND the served
runtime dir — Vite serves `public/` at the root as-is. The old root `assets/` mirror was
deleted (do not recreate it); `npm run sync:assets` is a no-op stub. Code references assets
via absolute served URL (`/assets/...`) only — never `../../assets/...`.

| Section     | URL used in code                                                                                                                                                            | Physical runtime file (public)                                                          | Fallback → `image-explorer`                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------- |
| S1 Hero     | `/assets/images/banners/hero-banner-tumpeng.png`                                                                                                                            | `frontend/public/assets/images/banners/hero-banner-tumpeng.png` ✅                      | `--query="nasi tumpeng syukuran celebration"`  |
| S2 (a)      | `/assets/images/lifestyle/wedding-buffet-lifestyle-shot.png`                                                                                                                | `frontend/public/assets/images/lifestyle/wedding-buffet-lifestyle-shot.png` ✅          | `--query="indonesian wedding buffet catering"` |
| S2 (b)      | `/assets/images/lifestyle/corporate-lunch-box-overhead-lifestyle.png`                                                                                                       | `frontend/public/assets/images/lifestyle/corporate-lunch-box-overhead-lifestyle.png` ✅ | same                                           |
| S3 a–d      | `/assets/images/products/{tumpeng/tumpeng-1.jpg, ai-generated/paket-prasmanan-nikahan.png, ai-generated/paket-nasi-box-hemat.png, ai-generated/paket-snack-box-arisan.png}` | mirror under `frontend/public/assets/images/products/…` ✅                              | per-category queries                           |
| S4 a–c      | `/assets/images/products/{tumpeng-mini/tumpeng-mini-1.jpg, paket-gold-ayam-bakar/paket-gold-ayam-bakar-1.jpg, ai-generated/paket-nasi-box-hemat.png}`                       | mirror under `frontend/public/assets/images/products/…` ✅                              | paket-specific queries                         |
| S8 texture  | `/assets/images/textures/kraft-paper-box-macro-texture.png`                                                                                                                 | `frontend/public/assets/images/textures/kraft-paper-box-macro-texture.png` ✅           | `--query="kraft paper texture warm"`           |
| Footer logo | `/assets/ui/logo.png`                                                                                                                                                       | `frontend/public/assets/ui/logo.png` ✅                                                 | —                                              |

**Mandate:** before building each section, verify the target file exists under `public/assets`. If missing/low-res/irrelevant → `node ~/.opencode/tools/image-explorer/search.js --query="…" --orientation=landscape` → save into `public/assets/<subfolder>/...` → reference the URL. Never ship a weak substitute.

---

## 7. Responsiveness

Mobile-first: 375 / 768 / 1024 / 1440. S1/S8 full-bleed with scrim; H1/H2 `clamp(32px, 7vw, 84px)`. S2 `grid-cols-1` → `lg:grid-cols-2`; S3 `1/2/4`; S4 horizontal-scroll on mobile → `lg:grid-cols-3`; S5/S7 `1 → md:grid-cols-4 / md:grid-cols-3`. Touch targets ≥44px; CTA full-width on mobile; no horizontal page scroll.

---

## 8. Tooling Integration & Verification Gates (MANDATORY per section)

> **After building each major section, the agent MUST run an internal check using `impeccable.style` and the local taste constraints** to ensure DENSITY 3 and VARIANCE 5 are not broken:
>
> 1. `npm run lint:design` — must stay clean (`[]`).
> 2. Dial audit: is this section still VARIANCE 5 (calm, mostly symmetric, editorial) and DENSITY 3 (airy, one idea per viewport)? If it drifted into SaaS-dashboard density or Awwwards-level variance — rework.
> 3. Aesthetic audit: warm OKLCH tokens only; `rounded-2xl` imagery; no card-in-card; one italic accent; textures at `opacity-5`; `prefers-reduced-motion` respected.
> 4. Visual verification: load the section in the browser and check the motion + reduced-motion states manually.

**Section close-out checklist:** pre-flight skills loaded (`catering-nusantara-design`, `motion-orchestration`, `shadcn-architecture`) → build → per-section check above → final `npm run typecheck && npm run lint && npm run lint:design` → `impeccable critique/polish` before ship.

---

_V2 Master Blueprint — approved by the project owner. Development begins in a fresh session after the tooling gate is re-greened (Section 0)._
