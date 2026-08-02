# Frontend Design — Suasana-Inspired "Down to Earth"

> UI/UX principles and the design tokens for the Catering Nusantara frontend. The palette is ported from the Suasana exploration app; the fonts remain the project defaults.

---

## 1. Principles

- **Local, not generic** — warm Nusantara earth tones, natural photography, subtle local texture accents. No corporate-catering feel.
- **Homey, not stiff** — rounded, friendly UI; high-key natural-light product photos (Dapur Solo style).
- **Consistent, not chaotic** — every color and font comes from tokens in `src/index.css`. Nothing is hardcoded in components.

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
| Heading / Display | **Merriweather Variable** (`--font-heading`) | Page titles, package names, taglines |
| Body / UI | **Figtree Variable** (`--font-sans`) | Descriptions, prices, admin/POS UI |

Loaded via Fontsource in `src/index.css`. Headings (`h1`–`h6`) force `--font-heading` in the base layer.

## 4. Radius & Shadows (ported)

- `--radius: 0.25rem` — base radius (Suasana); scale via `--radius-sm/md/lg/xl` (`calc(var(--radius) ± …)`).
- Shadow system ported from Suasana: `--shadow-x/y/blur/spread/opacity/color` primitives plus `--shadow-2xs … --shadow-2xl`, all mapped into Tailwind's `shadow-*` utilities.

## 5. Component & Styling Rules

- Build with **shadcn/ui** primitives (Radix) — reuse before creating.
- Use semantic tokens in every component: `bg-background`, `text-foreground`, `text-primary`, `bg-card`, `border-border`, `shadow-md`, `rounded-lg`, etc.
- ❌ No hardcoded hex/OKLCH colors or font names in components.
- ❌ Do not edit core `src/components/ui/` files — re-theme via `src/index.css`.
- Dark mode uses the `.dark` token block via the `@custom-variant dark` (class-based) strategy with `next-themes`.
