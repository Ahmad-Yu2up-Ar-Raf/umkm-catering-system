<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Frontend Design Spec (single design source of truth) · **Monorepo Root:** `../../`
>
> [Global Context](../../docs/project-context.md) · [Monorepo Architecture](../../docs/architecture.md) · [Backend API Specs](../../backend/docs/api-collection.md) · [Frontend Architecture](../docs/architecture.md)

# Frontend Design — Suasana-Inspired "Down to Earth"

> The single design specification for the Catering Nusantara platform. UI/UX principles, the Suasana-ported token system, fonts, radius/shadow scale, and component rules. **Stitch-9-compatible — this document is the single design source of truth (supersedes the root `DESIGN.md`, which was merged into this file and removed).** Read `../AGENTS.md` alongside this document.

---

## 1. Design Philosophy

The brand is called "Catering Nusantara" and sells the taste of "home cooking". These two principles must be visible, not just stated:

- **Local, not generic** — visual elements reference Nusantara culture: woven bamboo textures, banana leaves, subtle batik motifs as background accents — not corporate geometric patterns.
- **Homey, not stiff** — avoid the cold corporate-catering feel; rounded corners, natural photos (never stock), warm typography.

Agreed visual reference: **suasana.vercel.app** — calm, aesthetic, in harmony with nature. Take its *calmness* (OKLCH-based color palette, smooth transitions) without copying its layout exactly.

## 2. Palette (ported from Suasana — OKLCH)

Ported from `suasana-exploration-app/src/styles/styles.css`. All values are CSS variables in `src/index.css` (`:root` for light, `.dark` for dark mode) and mapped into Tailwind via `@theme inline`.

### Light mode

| Token | Value |
|---|---|
| `--background` | `oklch(0.9582 0.0152 90.2357)` — warm cream |
| `--foreground` | `oklch(0.376 0.0225 64.3434)` — warm dark brown |
| `--card` / `--popover` | `oklch(0.9914 0.0098 87.4695)` — near-white cream |
| `--primary` | `oklch(0.5628 0.0778 65.5444)` — earthy amber/brown |
| `--secondary` | `oklch(0.8846 0.0302 85.5655)` — soft warm sand |
| `--muted` | `oklch(0.9239 0.019 83.0636)` |
| `--accent` | `oklch(0.8348 0.0426 88.8064)` |
| `--destructive` | `oklch(0.5471 0.1438 32.9149)` — warm red |
| `--border` / `--input` | `oklch(0.8606 0.0321 84.5881)` |
| `--ring` | `oklch(0.618 0.0778 65.5444)` |

### Dark mode

| Token | Value |
|---|---|
| `--background` | `oklch(0.2747 0.0139 57.6523)` |
| `--foreground` | `oklch(0.9239 0.019 83.0636)` |
| `--card` / `--popover` | `oklch(0.3237 0.0155 59.0603)` |
| `--primary` | `oklch(0.7264 0.0581 66.6967)` |
| `--secondary` | `oklch(0.3795 0.0181 57.128)` |
| `--muted` | `oklch(0.2939 0.0125 62.1298)` |
| `--accent` | `oklch(0.4186 0.0281 56.3404)` |
| `--border` / `--input` | `oklch(0.3795 0.0181 57.128)` |

Full token set also includes `--chart-1..5`, `--sidebar-*`, and `--color-header` (see `src/index.css`).

## 3. Typography (project defaults — NOT ported)

| Role | Font | Usage |
|---|---|---|
| Heading / Display | **Fraunces Variable** (`--font-heading`) | Page titles, package names, taglines |
| Body / UI | **Space Grotesk Variable** (`--font-sans`) | Descriptions, prices, admin/POS UI |
| Accent word (italic) | **Instrument Serif** (`--font-accent`) | The single italic accent word per headline (Tiska paradigm, §10) |

Loaded via Fontsource in `src/index.css`. Headings (`h1`–`h6`) force `--font-heading` in the base layer. These fonts are a deliberate project choice — never swap them.

## 4. Radius & Shadows (ported)

- `--radius: 0.25rem` — base radius (Suasana); scale via `--radius-sm/md/lg/xl` (`calc(var(--radius) ± …)`).
- Shadow system ported from Suasana: `--shadow-x/y/blur/spread/opacity/color` primitives plus `--shadow-2xs … --shadow-2xl`, all mapped into Tailwind's `shadow-*` utilities.

## 5. "Local" Visual Elements

Used as **subtle accents**, not dominant elements — so the UI stays clean like the suasana.vercel.app reference, not busy:

- **Woven bamboo texture** — optional as a background for specific sections, at low opacity (~5-10%).
- **Banana leaf / thin batik motifs** — used sparingly as dividers or borders; must never interfere with text contrast.

## 6. Components & Styling Rules

- Build with **shadcn/ui** primitives (Radix) — reuse before creating.
- **No `tailwind.config.js`** — Tailwind v4 is CSS-first. All design customization (colors, border radius, fonts) is controlled centrally in `src/index.css`.
- Browser default outlines are replaced with shadcn's built-in `outline-ring/50` (see the base layer in `src/index.css`).
- Use semantic tokens in every component: `bg-background`, `text-foreground`, `text-primary`, `bg-card`, `border-border`, `shadow-md`, `rounded-lg`, etc.
- ❌ No hardcoded hex/OKLCH colors or font names in components.
- ❌ Do not edit core `src/components/ui/` files — re-theme via `src/index.css`.
- Dark mode uses the `.dark` token block via the `@custom-variant dark` (class-based) strategy with `next-themes`.

### 6.1 Component Stylings Reference

| Component | Token usage |
|---|---|
| Buttons | `bg-primary text-primary-foreground` primary; `secondary`/`muted`/`outline`/`destructive` variants via `cva`; focus ring via `ring` token |
| Cards | `bg-card text-card-foreground border-border rounded-lg shadow-sm` — **no card-in-card nesting** |
| Inputs / Selects | `border-input` hairlines; `focus-visible:ring-ring/50`; labels always visible (never placeholder-only) |
| Tables (admin) | `border-border` hairlines; `text-muted-foreground` secondary cells; header row `bg-muted/50` |
| Dialogs / Sheets (admin) | rounded, `shadow-xl`; motion via Framer `AnimatePresence` (code-split) |
| Toasts | `sonner` |

## 7. Do's and Don'ts

| Do | Don't |
|---|---|
| Semantic tokens everywhere (`bg-background`, `text-primary`, …) | Hardcoded hex/OKLCH/font names in components |
| Fraunces headings + Space Grotesk body | Inter/Arial/system-font substitution |
| Warm cream + earthy amber/brown family | Cold blue/grey dominance, purple-to-blue gradients, glassmorphism everywhere |
| One signature detail per surface | Decoration for its own sake; card-in-card; emojis as icons (use HugeIcons) |
| Nusantara texture (bamboo/batik) at ~5–10% opacity | Busy texture that hurts text contrast |
| Motion: one moment per viewport, 150–300ms, `prefers-reduced-motion` respected | Bounce/elastic easing; infinite-loop micro-animations; animating width/height |
| Natural photography (client assets in `frontend/public/assets/`) | Generic stock photos |

## 8. Responsive Behavior

- Mobile-first; breakpoints **375 / 768 / 1024 / 1440**.
- Catalog cards stack to a single column; admin sidebar collapses to a drawer/sheet on mobile.
- Touch targets ≥ 44×44px; no horizontal scroll; no zoom disable.

## 9. Agent Prompt Guide

> Build [page] for Catering Nusantara using `docs/design.md` + `design-system/MASTER.md`.
> Tokens from `src/index.css` (OKLCH warm cream/amber). Fraunces headings, Space Grotesk body.
> Check `design-system/pages/<page>.md` overrides first, else Master rules.
> After building: `npm run typecheck && npm run lint && npm run lint:design`.
> Colors: bg=warm cream, primary=earthy amber/brown, text=warm dark brown. Fonts: Fraunces/Space Grotesk + Instrument Serif accent.

## 10. Premium Motion & Visual Benchmark (Tiska Catering Paradigm)

> Scraped from **tiskacatering.com** (Next.js + Tailwind, warm dark-ink/gold/paper palette — the closest culinary-benchmark sibling to our warm cream/amber system). Evidence-based patterns observed in the shipped markup; effects map onto our GSAP stack (see `motion-orchestration` skill).

### 10.1 The Benchmark's Motion Grammar

1. **Masked word-reveal headlines.** Each word is `<span class="inline-block overflow-hidden">` wrapping an inner `<span style="transform: translateY(110%)">`, then tweened to `translateY(0)` with stagger. Signature scroll/entry reveal — every hero/about headline uses it.
2. **Editorial italic serif accent.** One word in the headline is `font-accent italic` in a warm gold tone (e.g. "Celebrate *Love* with the finest *flavours*"). Single emphasized word per line — never more.
3. **Fluid display type.** `font-display`, `font-light`, `leading-[1.05]`, `clamp(34px, 7vw, 84px)`, `font-variation-settings:'opsz' 144` (optical sizing maxed). Big, light, tight — editorial, never heavy.
4. **Uppercase letter-spaced eyebrow.** `text-[11px] uppercase tracking-[0.5em]` in deep-gold, fade-in via opacity. Micro-label above every section ("Est. 1980 — Bogor").
5. **Gradient hairline divider.** `h-px bg-[linear-gradient(90deg,transparent,var(--gold),transparent)]` with width animating `0 → 100%` — a center-out reveal used as section/hero separation.
6. **Full-screen preloader curtain.** A fixed `bg-ink` overlay slides up on load: `transform: translateY(0)` → off-screen with `transition: transform 1s cubic-bezier(0.76, 0, 0.24, 1)` — the cinematic entry moment.
7. **Floating pill header.** Fixed, centered, `rounded-full`, `transition-[top,padding,background-color,border-color] duration-500` — transparent over hero, shrinks & solidifies on scroll.
8. **Infinite marquee rails.** Client-logo bands with `animation-play-state: paused` on hover; cards lift via `transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(…)]`.
9. **Count-up stats.** Numbered `01–04` grid; values tween 0→N when scrolled into view.
10. **Sticky in-section sub-nav.** Secondary nav `sticky lg:top-28 self-start` beside FAQ/timeline content.

### 10.2 "Different worlds" bound by one narrative

Each section is structurally distinct, yet cohesive:

| Section | Rhythm |
|---|---|
| Hero | Full-bleed image overlay, word-reveal headline, pill nav above |
| Featured service | Split image + copy + WhatsApp CTA |
| About | Stacked multi-line headline + paired images |
| Stats | Numbered 01–04 grid with count-ups |
| Client logos | Hover-pause marquee band |
| History | Vertical year timeline (1980 → 1990 → …) |

**Cohesion glue:** one display serif + italic accent word, one token family (`bg-ink`, `ring-line`, `text-paper`, gold ramp), one rounded-card treatment, one motion grammar (masked reveals + transform/shadow transitions + curtain intro).

### 10.3 Mapping to Catering Nusantara (GSAP, no bottleneck)

| Benchmark pattern | Our implementation |
|---|---|
| Word-mask reveal | GSAP `ScrollTrigger` + masked word spans (stagger 0.05–0.08s) — hero & section headers only |
| Preloader curtain | One-time `useGSAP` intro on `/` (respect `prefers-reduced-motion` → skip) |
| Gold divider grow | ScrollTrigger scaleX 0→1 on `::after` gradient hairline |
| Count-up stats | GSAP snap + counter object, triggered once in view |
| Marquee | CSS `animation` + `animation-play-state` (no JS loop) |
| Pill header | CSS scroll class toggle (no GSAP needed) |

**Token mapping:** `text-paper`→`text-foreground`, `bg-ink`→`bg-background`/dark surface, gold ramp→`primary` amber, `ring-line`→`border-border`. **One signature moment per viewport** (per §7); the curtain is the only full-screen effect and only on the landing surface.

## 11. Unified Anti-Slop Enforcement Pipeline (Hallmark · Impeccable · Taste)

Three pillars, one pipeline — every UI surface passes all three before shipping:

| Pillar | Role | Enforcement |
|---|---|---|
| **1. Taste & Dials** | Choose the *direction* | `catering-nusantara-design` skill: VARIANCE 5 / MOTION 4 / DENSITY 3, warm OKLCH cream/amber tokens, Fraunces/Space Grotesk/Instrument Serif, "homey not stiff" |
| **2. Hallmark** | Shape the *structure* | `.opencode/skills/hallmark` (v1.1.0): macrostructure selection (structural variety — different pages ≠ same template), 57-gate slop test, pre-emit self-critique (Philosophy/Hierarchy/Execution/Specificity/Restraint/Variety, all ≥3), honest copy (gate 46), locked tokens (gate 48), no re-drawn chrome (gate 47), responsive floor 320/375/414/768 (gates 34, 49–53) |
| **3. Impeccable** | Verify the *code* | `npm run lint:design` (`impeccable detect src/`) — deterministic hard gate, must stay `[]`; `/impeccable critique|polish|audit` for review passes |

**Workflow:** Hallmark picks the macrostructure + runs the slop test → Taste dials + brand tokens bind the result to the Catering Nusantara identity → Impeccable validates the shipped code. Load order: `catering-nusantara-design` → `hallmark` → `impeccable`.

### Deliberate brand exceptions (documented overrides to Hallmark defaults)

1. **Italic accent word (Hallmark gate 38a).** Hallmark bans italicised emphasis in headings as an AI tell. Catering Nusantara deliberately allows **one italic accent word per headline** via `--font-accent` (Instrument Serif; Tiska-paradigm per §10) — e.g. `Cita Rasa *Rumahan*`, `Setiap perayaan adalah *kisah* Anda.` Constraints: never more than one word, never all-italic display, never italic in sub-headings/body-adjacent labels.
2. **Honest copy (Hallmark gate 46).** No fabricated metrics. The V2 homepage stats (S5: `100+ Acara terlayani`, `40+ Pilihan menu`) and testimonials (S6) are placeholders that MUST be replaced with real client numbers/names before launch — or rendered as `—` + "metric to confirm" per Hallmark. The registered client data in `docs/HOMEPAGE_BUILD.md` §0.1 (Eva Rudianti, 2024, contact) is real and stays verbatim.
