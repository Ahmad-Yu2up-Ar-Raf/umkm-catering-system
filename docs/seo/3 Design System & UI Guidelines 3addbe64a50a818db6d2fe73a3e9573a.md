# 3. Design System & UI Guidelines

# Design System & UI Guidelines

## Design Philosophy — "Down to Earth"

Brand: **Catering Nusantara** — selling "masakan rumah" (home cooking). Two principles must be *visible*, not just stated:

1. **Melokal, bukan generik** — Visual elements reference Nusantara culture: bamboo texture, banana leaf motifs, subtle batik patterns as background accents. NOT corporate geometric patterns.
2. **Homey, bukan kaku** — Avoid cold corporate catering feel. Rounded corners, natural photos (no stock photos), warm typography.

**Visual reference:** [suasana.vercel.app](http://suasana.vercel.app) — calm, aesthetic, connected to nature. Take the *tranquility* (OKLCH color palette, smooth transitions) without copying the layout.

## Color Palette — Earth Tones (Tailwind v4 OKLCH)

Configured via CSS variables in `src/index.css` using `@theme inline`. NO `tailwind.config.js` file.

| Token | Value (OKLCH) | Usage |
| --- | --- | --- |
| `--color-background` | oklch(0.98 0.01 85) | Warm off-white page background |
| `--color-foreground` | oklch(0.15 0.02 85) | Dark text on light bg |
| `--color-primary` | oklch(0.55 0.12 45) | Warm earth tone — buttons, links |
| `--color-primary-foreground` | oklch(0.98 0.01 85) | Text on primary bg |
| `--color-secondary` | oklch(0.75 0.08 95) | Soft accent — badges, highlights |
| `--color-muted` | oklch(0.92 0.02 85) | Subtle backgrounds, cards |
| `--color-accent` | oklch(0.65 0.15 35) | Warm accent — CTA, emphasis |
| `--color-destructive` | oklch(0.55 0.18 25) | Error states, delete actions |
| `--color-card` | oklch(0.99 0.005 85) | Card backgrounds |
| `--radius` | 0.625rem (10px) | Rounded corners for warmth |

## Typography

| Role | Font | Weight Range | Usage |
| --- | --- | --- | --- |
| **Heading / Display** | Merriweather (serif) | 400-900 | Premium, classic, warm. Page titles, package names, taglines |
| **Body / UI** | Figtree (sans-serif) | 300-700 | Clean, modern, readable. All body text, prices, UI labels |

**Implementation:**

```css
/* In src/index.css */
@import "@fontsource/merriweather";
@import "@fontsource/figtree";

@theme inline {
  --font-heading: "Merriweather", serif;
  --font-sans: "Figtree", sans-serif;
}
```

## Visual Elements "Melokal"

Used as SUBTLE accents (5-10% opacity), NOT dominant elements:

- **Anyaman bambu texture** — Optional section background, very low opacity
- **Daun pisang / batik motif** — Minimal use as dividers or borders. Never reduce text contrast.

Keep it clean like [suasana.vercel.app](http://suasana.vercel.app) — not busy.

## Component Architecture

### Base UI (shadcn/ui)

All from shadcn/ui (Radix primitives). NEVER build custom when equivalent exists.

- Button, Card, Input, Select, Dialog, Sheet, Table, Badge, Separator, Tabs, Toast/Sonner, Tooltip, Form

### Domain Components

| Component | Purpose | States Needed |
| --- | --- | --- |
| PackageCard | Catalog grid item | Default, Hover, Selected |
| PackageDetail | Full package view | Loading, Loaded, Error |
| PortionCalculator | Real-time price preview | Empty, Calculated, Invalid |
| OrderForm | Admin order input | Empty, Calculating, Submitted, Error |
| InvoicePreview | Struk/receipt view | Loading, Ready, Print |
| GalleryGrid | Photo grid | Loading, Loaded, Empty |
| DashboardStats | Metric cards | Loading, Loaded, Error |
| SearchFilter | Catalog search + filter | Default, Active, No Results |

### Every Component Must Handle:

- **Loading state** — Skeleton/Spinner
- **Empty state** — Friendly message + CTA
- **Error state** — Error message + retry button
- **Edge case** — Very long text, missing images, 0 results

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
| --- | --- | --- |
| Mobile | < 640px | Single column, hamburger menu, stacked cards |
| Tablet | 640-1024px | 2-column grid, condensed nav |
| Desktop | > 1024px | Full layout, 3-column grid, side filters |

Admin POS is primarily desktop-optimized but should work on tablet.

## Image Guidelines

- **No stock photos.** Use client's actual food and event photography.
- Package images: Square aspect ratio (1:1), min 600x600px
- Gallery images: Landscape (16:9), min 1200x675px
- Format: WebP preferred for performance, fallback JPG
- Hero/banner: 1920x600px with text overlay gradient

## Consistent Spacing

```css
@theme inline {
  --spacing-section: 4rem;     /* Large section padding */
  --spacing-card-gap: 1.5rem;  /* Gap between cards */
  --spacing-content: 2rem;     /* Content padding */
}
```

## Accessibility Requirements

- All images must have descriptive `alt` text
- Color contrast ratio ≥ 4.5:1 for normal text
- Focus indicators visible on all interactive elements
- Form inputs have associated labels
- Semantic HTML (nav, main, section, article, aside)
- ARIA labels where necessary