---
name: catering-nusantara-design
description: Brand-bound design rules for Catering Nusantara — "home cooking, down to earth". Pins taste dials low-moderate, locks the warm-cream/brown OKLCH Suasana tokens, and routes design work through the Impeccable commands (shape -> critique -> polish -> audit). Use for ANY page, component, or visual work under frontend/ so output never drifts into generic AI-slop SaaS styling. Companion to docs/design.md.
---

# Catering Nusantara — Brand Design Rules

The brand sells the taste of **home cooking**. Two principles must be visible, not stated:
**Local, not generic** (bamboo/banana-leaf/batik accents as subtle texture) and **Homey, not stiff**
(rounded, warm, natural photography — never corporate cold). Visual reference: suasana.vercel.app —
calm and aesthetic; borrow its calmness, not its layout.

## Mandatory Pre-Flight (every UI task)

1. State a one-line **Design Read**: "Reading this as: <page kind> for <audience>, <vibe>, leaning toward <system>."
2. Set the three dials (from the taste-skill model) — **Catering Nusantara pins these LOW-MODERATE**:
   - `DESIGN_VARIANCE: 5` — calm, mostly symmetric, editorial warmth
   - `MOTION_INTENSITY: 4` — purposeful motion, one signature moment per viewport
   - `VISUAL_DENSITY: 3` — airy; homey, not packed
3. Run the Impeccable loop on new surfaces: `/impeccable shape` (plan) → `critique` (review) → `polish` (final pass) → `audit` (a11y/perf).

## Token Discipline (NON-NEGOTIABLE)

- Use ONLY semantic Tailwind tokens from `src/index.css` (`bg-background`, `text-foreground`, `text-primary`, `bg-card`, `border-border`, `shadow-md`, `rounded-lg`, …). Light + `.dark` blocks exist.
- ❌ NEVER hardcode hex/OKLCH/font names in components. ❌ Do not edit core `src/components/ui/` files.
- Fonts are fixed: **Merriweather Variable** (headings) + **Figtree Variable** (body/UI). Do not swap.
- Warm-cream family (oklch 0.95 0.01 90) + earthy amber/brown primary (oklch 0.56 0.08 65). No cold blues/greys as dominant surfaces.

## Anti-Slop Guardrails (enforced by `npm run lint:design` = `impeccable detect`)

- ❌ Inter/Arial/system fonts, purple-to-blue gradients, glassmorphism everywhere, glowing particles, bounce/elastic easing.
- ❌ Cards nested in cards; identical 3-equal-card feature grids; gray text on colored backgrounds; pure black/gray (always tint).
- ❌ AI copywriting clichés ("Elevate", "Seamless", "Delve"); emojis as icons (use HugeIcons).

## Local "Nusantara" Elements

Subtle accents only: woven-bamboo texture as section backgrounds at ~5–10% opacity; thin banana-leaf/batik motifs as dividers or borders. Never reduce text contrast. One signature detail per surface — spend boldness in exactly one place.

## Context

- Tokens & palette: `src/index.css` and `docs/design.md`
- Design source of truth: `docs/design.md` (Stitch-9-compatible, merged from the removed root `DESIGN.md`)
- Design-system master + page overrides: `design-system/MASTER.md` and `design-system/pages/`
