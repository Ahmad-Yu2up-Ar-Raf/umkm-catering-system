# TISKA SYSTEM DESIGN — Catering Nusantara Editorial & Motion Context

> AI-friendly, single-reference deconstruction of our premium editorial benchmark:
> **https://tiskacatering.com/** (Next.js + Tailwind, warm dark-ink / cream / gold palette) — the
> closest culinary-benchmark sibling to our warm cream/amber Catering Nusantara system.
> This file distills its **typography, palette, layout micro-interactions, and motion grammar**
> into rules an AI agent can apply directly to our React + Vite + GSAP + Framer Motion stack.
> Companion doc: `design.md` §10 (the shipped evidence) + §11 (anti-slop pipeline).
>
> **Rule of thumb:** if a micro-interaction can be added in one line of CSS/GSAP that reads
> "premium, calm, editorial" — add it. If it needs a shadow, a gradient, or a snap — it's not Tiska.

---

## 1. Design Read & Taste Dials

**Reading this as:** a warm, editorial, luxury catering brand for Bogor/Jabodetabek — calm,
confident, generous — *"masakan rumah, sajian istimewa."* Leaning toward a **warm-minimal
editorial** system with **one signature motion per viewport**.

| Dials | Value | What it means |
|---|---|---|
| `DESIGN_VARIANCE` | 5 | Calm, mostly symmetric, editorial warmth — structural *variety between sections*, not within |
| `MOTION_INTENSITY` | 4 | Purposeful motion — one signature moment per viewport |
| `VISUAL_DENSITY` | 3 | Airy; homey, not packed |

Binding fonts (project-locked, never swap): **Fraunces Variable** (headings) · **Space Grotesk
Variable** (body/UI) · **Instrument Serif** (`--font-accent`, the single italic accent word).

---

## 2. Typography

Editorial pairing is the backbone of the system. Two textures everywhere, bound by one accent.

| Role | Face | Behaviour |
| --- | --- | --- |
| **Display / Headline** | Fraunces, `font-light`, `leading-[1.05]`, fluid `clamp(32px, 6vw, 76px)`, `font-variation-settings:'opsz' 144` | Big, light, tight — editorial, never heavy |
| **Eyebrow / Micro-label** | Space Grotesk, `text-[11px] uppercase tracking-[0.5em]`, in `text-primary` | Over every section; the quiet "cross-stitch" of the page |
| **Body / UI** | Space Grotesk, `text-sm md:text-base`, `leading-relaxed`, `text-muted-foreground` | Restrained; never competes with headlines |
| **Italic accent word** | Instrument Serif (`--font-accent`), `italic`, `text-primary` | **Exactly one per headline** — e.g. *Rumahan*, *kisah*, *ditanyakan.* Never more, never body text |

Eyesight rule: headlines may be light & large; body stays comfortable. No text on busy texture.

---

## 3. Palette (token → semantic)

Tiska uses a **warm ink + paper + gold** ramp. We map it onto our OKLCH Suasana tokens
in `src/index.css` — ALWAYS via semantic Tailwind tokens, never raw hex in components.

| Tiska notion | Value | Map to semantic token |
| --- | --- | --- |
| Paper / cream canvas | `#FAF7F2` family | `bg-background` (oklch 0.9582 0.0152 90.2357) |
| Ink / text | warm dark | `text-foreground` |
| Gold / amber accent | `--primary` | `text-primary`, `bg-primary` (earthy amber 0.5628 0.0778 65.54) |
| Hairline lines | subtle warm grey | `border-border` |
| Raised card | near-white cream | `bg-card`, `border-border` |
| Muted secondary | warm sand | `text-muted-foreground`, `bg-muted` |

**Contrast blocks:** warm cream background + warm dark-brown foreground. Never a cold blue/grey
surface. No pure black/grey (always tinted). `opacity-5` kraft/batik texture layers only, never
above content.

---

## 4. Layout & Micro-Interactions

The system's choreography relies on hairline structure + glide + center-out reveals. This is
the part agents forget. Bake it in.

### 4.1 Signature micro-patterns

| Pattern | Implementation | Rule |
| --- | --- | --- |
| **Sticky in-section sub-nav** | `sticky lg:top-28 self-start` beside content (FAQ / timeline) | Left column stays; body scrolls under |
| **Hover-line expand** | a 1–2px vertical line that grows `0 → ~16px` on hover (`group-hover:h-4`), then **snaps off the instant the item turns active** (`transition-none` when active) | Use for category/tab lists |
| **Gliding active indicator** | Framer Motion `layoutId` vertical line, `left-0`, vertically centred; glide between items with a spring | The premium "pointing finger" |
| **Center-out shimmer line** | a gradient hairline `h-px bg-[linear-gradient(90deg,transparent,currentColor,transparent)]` whose `scaleX` goes `0 → 1` when scrolled into view | Section separation |
| **Masked word-reveal** | each word `overflow-hidden` span, inner `translateY(110%) → 0`, staggered | Signature entry for every major headline |
| **Hover lift** | `transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]` — image `scale(1.05)` 400ms, shadow `sm→lg` | Cards, never bounce |

### 4.2 Luxury pacing (the "slow is fast" rule)

Everything *arrives*, nothing *teleports*.

- **No abrupt snaps.** Any state change that moves the eye is a tween, not a class toggle.
- **Margins/gaps move smoothly.** If an open/close or an appear/disappear shifts a margin or
  gap, animate the parent height/padding with the content so nothing "jumps."
- **One thing moves at a time.** If two things change simultaneously, stagger them 80–120ms.
- **Exit matters.** A UI that animates only on the way in reads as unfinished and aggressive.
  Fade + collapse gracefully on the way out too.

---

## 5. Motion Grammar (GSAP primary + Framer Motion for layout glide)

### 5.1 Easing & durations

| Use | Ease | Duration |
| --- | --- | --- |
| Section / item reveal | `power3.out` | **0.6–0.8s** |
| Micro hover / small UI | `power2.out` | 0.3–0.5s |
| Content collapse / text reveal | `power2.out` | **0.5–0.6s** |
| Entrance (curtain/mask) | `expo.inOut` | 0.9–1.0s |
| Divider hairline | `power2.inOut` | 0.8–1.2s |

- Never `bounce` / `elastic`; never `linear` for UI (except infinite marquee).
- Repeat accent tweens are banned; one signature entrance per viewport.

### 5.2 Framer Motion spring physics (active indicators & layoutId glides)

For `layoutId` shared-layout glides (category tabs, accordion active indicator) use a
**soft, damped, slightly heavy** spring so the line *glides*, not snaps:

```ts
const GLIDE_SPRING = {
  type: "spring",
  stiffness: 200, // low → soft & smooth
  damping: 28,    // high-ish → no wobble / no overshoot
  mass: 0.8,      // slightly heavier → calm, intentional
} as const
```

**Condition swap:** `transition={{ height: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.35, ease: "easeOut" } }}`.

### 5.3 Shared-layout (layoutId) best practices — the "jump to bottom" bug

The most common defect: clicking from item #2 → item #1 (bottom-to-top) makes the indicator
**jump to the bottom before gliding up**. Causes and the fix:

1. **Wrap the list in `<LayoutGroup>`** so co-occurring projections share one space.
2. **Give the container `position: relative`** and scope the line to the *stable* element
   (the trigger row), not the item whose height is collapsing at the same moment.
3. **Keep heights stable during the glide.** If an open item collapses its content in the
   same commit the line moves, the origin coordinate is measured mid-collapse and the line
   "jumps." Hold the closing content mounted (exit animation) so the y-coordinates stay
   stable until the line lands.
4. **One `layoutId` per indicator kind.** Never reuse a single `layoutId` for two unrelated
   glides (category + accordion) — you get cross-talk.

### Framer Motion redux reference

**Accordion exit (combine Radix + Framer):** pass `forceMount` to the Radix/Shadcn content and
wrap its inner node in `<AnimatePresence>`; animate `height` `auto → 0` and `opacity` `1 → 0`
so closing is as graceful as opening. No jerky margin/gap jump — animate the parent *with* the
flow (this doc §4.2).

```
shadcn/base  → Accordion / AccordionItem / AccordionTrigger (non-negotiable)
motion-rs   → GSAP for scroll reveals; Framer Motion for layoutId glides + AnimatePresence
```

### prefers-reduced-motion (non-negotiable)

Every animation honors `prefers-reduced-motion: reduce` → **static render** (no transform,
no height, no opacity tween). Gate GSAP with `useReducedMotion`, and let `MotionConfig
reducedMotion="user"` handle Framer. Code execution completed — verify visually in the
browser (including the reduced-motion pass).

---

## 6. The grain of "One signature per surface"

Choose ONE bold detail — the gliding amber line, the masked headline, the center-out hairline,
the curtain — and keep the rest calm. If two surfaces want the same signature, one of them is
wrong. This is what separates "premium editorial" from "every AI uses the same five textures."

## 7. Apply (checklist before shipping any FAQ/editorial block)

- [ ] Fraunces headline + ONE `font-accent` italic word; no all-italic headings.
- [ ] Hairline codices; vertical hover-line that snaps off on active; gliding `layoutId` line
      with `GLIDE_SPRING`.
- [ ] Category description reveal `→ 0.55s power2.out` (calm, luxurious).
- [ ] Accordion open AND close animate (forceMount + AnimatePresence); no margin jumps.
- [ ] Category switch = **staggered** per-item reveal (incl. final separator) — not one blur.
- [ ] Every tween honors `prefers-reduced-motion`.
- [ ] Semantic tokens only; no raw colors/fonts/shadow-gradients in components.