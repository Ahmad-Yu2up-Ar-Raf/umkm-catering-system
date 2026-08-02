# Design System — Catering Nusantara "Down to Earth"

> Design guide for developers and AI coding agents. Goal: every page should feel warm, authentic, and "local" — not a generic corporate catering template.

---

## 1. Design Philosophy

The brand is called "Catering Nusantara" and sells the taste of "home cooking". These two principles must be visible, not just stated:

- **Local, not generic** — visual elements reference Nusantara culture: woven bamboo textures, banana leaves, subtle batik motifs as background accents, not corporate geometric patterns[cite: 6].
- **Homey, not stiff** — avoid the cold corporate-catering feel; rounded corners, natural photos (not stock photos), warm typography[cite: 6].

Agreed visual reference: **suasana.vercel.app** — calm, aesthetic, in harmony with nature. Take its *calmness* (OKLCH-based color palette, smooth transitions) without copying the exact layout[cite: 6].

---

## 2. Color Palette — "Earth Tones" (Tailwind v4 OKLCH)

The project uses Tailwind CSS v4 with the **OKLCH** color system so color transitions are smoother and consistent with the "Suasana" vibe. The concrete palette (light + dark), radius, and shadow variables are **ported from the Suasana exploration app** — see `frontend/docs/design.md` for the full token table.

Colors are no longer configured with HEX in `tailwind.config.js`[cite: 6]; instead they are set directly through CSS variables in `index.css` using `@theme inline`.

- **Background & Foreground:** a clean, high-contrast color combination for readability[cite: 7].
- **Primary & Secondary:** warm *earth tones* for buttons and interactive elements[cite: 7].
- **Radius:** rounded corners set at a base of `0.25rem` (ported from the Suasana app) so the UI feels friendlier and less rigid.

---

## 3. Typography

The project uses a Fontsource font combination to ensure optimal loading[cite: 7]:

| Role | Font | Rationale / Usage |
|---|---|---|
| Heading / Display | **Merriweather Variable** | This serif font gives a premium, classic, and warm feel[cite: 7]. Used specifically for page titles, catering package names, and taglines. |
| Body / UI | **Figtree Variable** | A modern, clean, highly readable sans-serif font[cite: 7]. Used for all description text, prices, and Admin/POS UI components. |

*Implementation:* configured through the `--font-sans` and `--font-heading` variables in CSS, and referenced in the `@layer base` block[cite: 7].

---

## 4. "Local" Visual Elements

Used as **subtle accents**, not dominant elements — so it still feels clean like the suasana.vercel.app reference, not busy[cite: 6]:

- **Woven bamboo texture** — optional as a background for specific sections, at low opacity (~5-10%)[cite: 6].
- **Banana leaf / thin batik motifs** — used sparingly as dividers or borders; must never interfere with text contrast[cite: 6].

---

## 5. UI Components — Shadcn/UI (Tailwind v4)

Use **shadcn/ui** as the component base[cite: 6]. Because we use Tailwind v4:
- Do NOT create or look for a `tailwind.config.js` file.
- All design customization (colors, border radius, fonts) is controlled centrally in `src/index.css`[cite: 7].
- There is special styling to remove the browser's default outline and replace it with shadcn's built-in `outline-ring/50`[cite: 7].
