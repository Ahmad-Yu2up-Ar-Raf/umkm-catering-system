# Design System — MASTER (Catering Nusantara)

Global source of truth. Page-specific overrides live in `design-system/pages/<page>.md` and **override** these rules for that page only. (Structure follows the ui-ux-pro-max master/overrides pattern.)

## Product Type
Food delivery / catering service — hybrid: public catalog (conversion to WhatsApp) + internal admin CMS/Mini POS.

## Style Profile (taste dials — pinned low-moderate)
- DESIGN_VARIANCE: 5 · MOTION_INTENSITY: 4 · VISUAL_DENSITY: 3
- Family: **Soft UI Evolution / Organic Biophilic** lean — warm, calm, homey. NOT glassmorphism, NOT brutalist, NOT AI-purple.

## Colors (semantic tokens only — from `src/index.css`, DO NOT change)
- Background: warm cream `oklch(0.9582 0.0152 90.2357)` · Dark: `oklch(0.2747 0.0139 57.6523)`
- Primary: earthy amber/brown `oklch(0.5628 0.0778 65.5444)` · Secondary: warm sand `oklch(0.8846 0.0302 85.5655)`
- Text: warm dark brown `oklch(0.376 0.0225 64.3434)` · Destructive: warm red `oklch(0.5471 0.1438 32.9149)`
- ❌ Never hardcode; use `bg-background`, `text-primary`, `border-border`, `shadow-md`, `rounded-lg`, …

## Typography
- Headings: Fraunces Variable (`font-heading`) · Body/UI: Space Grotesk Variable (`font-sans`) · Accent italic: Instrument Serif (`font-accent`). Fixed.

## Effects & Motion
- Transitions 150–300ms; hover states subtle; **one signature motion per viewport**; respect `prefers-reduced-motion`.
- Admin POS mount/unmount: Framer Motion `AnimatePresence` (code-split). Public: GSAP (`useGSAP` + ScrollTrigger).

## Components
- shadcn/ui primitives (`src/components/ui/`), extended with `cva` + `cn()`. Never edit core `ui/` files.

## Anti-Patterns (must never ship)
- Inter/system fonts, purple gradients, glassmorphism-everywhere, glow particles, bounce easing
- Card-in-card, 3-equal-card grids, gray text on colored bg, pure black/gray, emoji icons
- Filler lorem ipsum — use real contextual content

## Pre-Delivery Checklist
- [ ] `npm run typecheck` && `npm run lint` && `npm run lint:design` (impeccable detect, must stay clean)
- [ ] Semantic tokens only; no hex/fonts in components
- [ ] WCAG AA contrast; visible focus; keyboard nav; `prefers-reduced-motion` respected
- [ ] Responsive 375/768/1024/1440; touch targets ≥44px
- [ ] No stock photos (client assets in `assets/`)

## Sources
- docs/design.md (design source of truth) · src/index.css · AGENTS.md
