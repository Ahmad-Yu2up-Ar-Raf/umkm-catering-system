# Page Override — Galeri Perayaan (Galeri)

Overrides MASTER.md for the public gallery page only. Full blueprint: `docs/specs/galeri-page-spec.md`.

## Layout
- Editorial hero: eyebrow "Portofolio" + Fraunces H1 (`Galeri *perayaan*`, one Instrument Serif accent word) + WhatsApp CTA; desktop right-whitespace uses the scroll-rotating brand Tumpeng.
- Featured signature: full-width crossfade display on a `bg-secondary/60` band; caption + category Badge + event-meta strip (venue · date · guests — unverified renders "—") + expand trigger; auto-advances every 6s, paused while the lightbox is open.
- Sticky category pill bar (`useHeaderOffset`) with a sliding `layoutId` pill (tween `[0.16,1,0.3,1]`, 0.5s — never a spring) + "N momen" count. Filter state IS the URL (`?kategori=`).
- "Semua" → horizontal cluster rails per category (native `overflow-x-auto snap-x`, edge masks). Single category → responsive grid (`sm:2` / `lg:3`) with first tile `lg:col-span-2` and alternating `4/3`·`3/4` aspects.
- Fullscreen lightbox: Radix Dialog, `object-contain`, footer caption/badge/meta/position, prev/next + ArrowLeft/Right keys.

## Data
- v1 static: `galeri-data.ts` → `use-galeri-query.ts` (React Query seam, `initialData`). When the backend `kategori_acara` contract lands (spec §4.4), swap the `queryFn` to `GET /api/v1/galeri` — no component changes.

## Motion
- ONE GSAP hero reveal (opacity/y 24px, stagger 0.08s) + the featured crossfade's own timeline. `MotionConfig reducedMotion="user"` on the block; featured static + pill snap under `prefers-reduced-motion`. Nothing else animates.
- Lazy media via `MediaItem` (@unpic, `loading="lazy"`); skeleton tiles only on query loading.
