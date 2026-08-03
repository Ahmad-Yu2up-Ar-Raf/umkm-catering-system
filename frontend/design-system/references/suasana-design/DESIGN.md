# suasana DESIGN.md

> Auto-generated design system — reverse-engineered via static analysis by skillui.
> Frameworks: None detected
> Colors: 16 · Fonts: 1 · Components: 0
> Icon library: not detected · State: not detected
> Primary theme: light · Dark mode toggle: yes · Motion: expressive

## Visual Reference

**Match this design exactly** — study colors, fonts, spacing, and component shapes before writing any UI code.

![suasana Homepage](../screenshots/homepage.png)

---

## 1. Visual Theme & Atmosphere

This is a **light-themed** interface with a warm, approachable feel. The light background emphasizes content clarity. Typography uses **SFMono-Regular** throughout — a technical, developer-focused choice that maintains consistency. Spacing follows a **4px base grid** (compact density), with scale: 4, 8, 12, 16, 20, 24, 28, 32px. The accent color **#dd7400** anchors interactive elements (buttons, links, focus rings). Motion is expressive — spring physics, layout animations, and staggered reveals are part of the visual language.

---

## 2. Color Palette & Roles

| Token | Hex | Role | Use |
|---|---|---|---|
| tw-ring-offset-color | `#ffffff` | background | Page background, darkest surface |
| surface | `#ffcaca` | surface | Card and panel backgrounds |
| color-black | `#000000` | text-primary | Headings and body text |
| text-muted | `#90a1b9` | text-muted | Captions, placeholders, secondary info |
| accent | `#dd7400` | accent | CTAs, links, focus rings, active states |
| danger | `#fb2c36` | danger | Error states, destructive actions |
| success | `#00bb7f` | success | Success states, positive indicators |
| warning | `#f99c00` | warning | Warning states, caution indicators |
| unknown | `#edb200` | unknown | Palette color |
| unknown | `#fcbb00` | unknown | Palette color |
| unknown | `#6a7282` | unknown | Palette color |
| unknown | `#eee8da` | unknown | Palette color |
| unknown | `#7b3306` | unknown | Palette color |
| unknown | `#004e3b` | unknown | Palette color |
| unknown | `#bf000f` | unknown | Palette color |
| unknown | `#82181a` | unknown | Palette color |

### Dark Mode Token Mapping

| Variable | Light | Dark |
|---|---|---|
| `--background` | `oklch(95.82% .0152 90.2357)` | `oklch(27.47% .0139 57.6523)` |
| `--foreground` | `oklch(37.6% .0225 64.3434)` | `oklch(92.39% .019 83.0636)` |
| `--card` | `oklch(99.14% .0098 87.4695)` | `oklch(32.37% .0155 59.0603)` |
| `--card-foreground` | `oklch(37.6% .0225 64.3434)` | `oklch(92.39% .019 83.0636)` |
| `--popover` | `oklch(99.14% .0098 87.4695)` | `oklch(32.37% .0155 59.0603)` |
| `--popover-foreground` | `oklch(37.6% .0225 64.3434)` | `oklch(92.39% .019 83.0636)` |
| `--primary` | `oklch(56.28% .0778 65.5444)` | `oklch(72.64% .0581 66.6967)` |
| `--primary-foreground` | `oklch(100% 0 0)` | `oklch(27.47% .0139 57.6523)` |
| `--secondary` | `oklch(88.46% .0302 85.5655)` | `oklch(37.95% .0181 57.128)` |
| `--secondary-foreground` | `oklch(43.13% .03 64.9288)` | `oklch(92.39% .019 83.0636)` |
| `--muted` | `oklch(92.39% .019 83.0636)` | `oklch(29.39% .0125 62.1298)` |
| `--muted-foreground` | `oklch(53.91% .0387 71.1655)` | `oklch(79.82% .0243 82.1078)` |
| `--accent` | `oklch(83.48% .0426 88.8064)` | `oklch(41.86% .0281 56.3404)` |
| `--accent-foreground` | `oklch(37.6% .0225 64.3434)` | `oklch(92.39% .019 83.0636)` |
| `--border` | `oklch(86.06% .0321 84.5881)` | `oklch(37.95% .0181 57.128)` |
| `--input` | `oklch(86.06% .0321 84.5881)` | `oklch(37.95% .0181 57.128)` |
| `--ring` | `oklch(61.8% .0778 65.5444)` | `oklch(72.64% .0581 66.6967)` |
| `--chart-1` | `oklch(61.8% .0778 65.5444)` | `oklch(72.64% .0581 66.6967)` |
| `--chart-2` | `oklch(56.04% .0624 68.5805)` | `oklch(67.77% .0624 64.7755)` |
| `--chart-3` | `oklch(48.51% .057 72.6827)` | `oklch(61.8% .0778 65.5444)` |

### CSS Variable Tokens

```css
--tw-border-style: solid;
--color-border: var(--border);
--tw-border-style: dashed;
--tw-border-style: none;
--tw-border-style: none;
--background: oklch(95.82%.0152 90.2357);
--foreground: oklch(37.6%.0225 64.3434);
--card: oklch(99.14%.0098 87.4695);
--card-foreground: oklch(37.6%.0225 64.3434);
--popover: oklch(99.14%.0098 87.4695);
--popover-foreground: oklch(37.6%.0225 64.3434);
--primary: oklch(56.28%.0778 65.5444);
--primary-foreground: oklch(100%0 0);
--secondary: oklch(88.46%.0302 85.5655);
--secondary-foreground: oklch(43.13%.03 64.9288);
--muted: oklch(92.39%.019 83.0636);
--muted-foreground: oklch(53.91%.0387 71.1655);
--accent: oklch(83.48%.0426 88.8064);
--accent-foreground: oklch(37.6%.0225 64.3434);
--destructive: oklch(54.71%.1438 32.9149);
```


---

## 3. Typography Rules

**Font Stack:**
- **SFMono-Regular** — Heading 1, Heading 2, Heading 3, Body, Caption, Code

| Role | Font | Size | Weight |
|---|---|---|---|
| Heading 1 | SFMono-Regular | 6rem | 700 |
| Heading 2 | SFMono-Regular | 16px | 700 |
| Heading 3 | SFMono-Regular | .8rem | 700 |
| Body | SFMono-Regular | .7rem | 400 |
| Caption | SFMono-Regular | 11px | 400 |
| Code | SFMono-Regular | 14px | 400 |

**Typographic Rules:**
- Use **SFMono-Regular** for all text — do not mix font families
- Maintain consistent hierarchy: no more than 3-4 font sizes per screen
- Headings use bold (600-700), body uses regular (400)
- Line height: 1.5 for body text, 1.2 for headings
- Use color and opacity for secondary hierarchy, not additional font sizes


---

## 4. Component Stylings

No components detected. Scan `src/components/` or `components/` to populate this section.

---

## 5. Layout Principles

- **Base spacing unit:** 4px
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48
- **Border radius:** .25rem, 2px, 3.2px, 30px, inherit
- **Max content width:** 96rem

**Spacing as Meaning:**
| Spacing | Use |
|---|---|
| 4-8px | Tight: related items within a group |
| 12-16px | Medium: between groups |
| 24-32px | Wide: between sections |
| 48px+ | Vast: major section breaks |


---

## 6. Depth & Elevation

No box-shadow values detected. The design appears to use a flat visual style.

**Z-Index Scale:** `0, 1, 3, 10, 20, 30, 40, 50, 60, 99, 100, 999, 9999, 999999, 9999999, 99999999, 999999999, 2147483647`


---

## 7. Animation & Motion

This project uses **expressive motion**. Animations are an integral part of the experience.

### CSS Animations

- `@keyframes reveal`
- `@keyframes spin`
- `@keyframes ping`
- `@keyframes pulse`
- `@keyframes enter`
- `@keyframes exit`
- `@keyframes infiniteScroll`
- `@keyframes infiniteScrollRigth`

### Motion Guidelines

- Duration: 150-300ms for micro-interactions, 300-500ms for page transitions
- Easing: `ease-out` for enters, `ease-in` for exits
- Always respect `prefers-reduced-motion`


---

## 8. Do's and Don'ts

### Do's

- Use `#dd7400` for interactive elements (buttons, links, focus rings)
- Use `#ffffff` as the primary page background
- Follow the **4px** spacing grid for all margins, padding, and gaps
- Use border and background shifts for elevation — not shadows
- Use border-radius from the scale: .25rem, 2px, 3.2px, 30px, inherit
- Always use CSS variables for colors — never hardcode hex
- Test both light and dark modes for contrast

### Don'ts

- Don't introduce colors outside this palette — extend the design tokens first
- Don't use arbitrary spacing values — stick to multiples of 4px
- Don't add box-shadow — this design system uses flat elevation
- Don't use arbitrary border-radius values — pick from the defined scale
- Don't use backdrop-blur or blur effects

### Anti-Patterns (detected from codebase)

- No box-shadow on any element
- No blur or backdrop-blur effects
- No zebra striping on tables/lists


---

## 9. Responsive Behavior

| Name | Value | Source |
|---|---|---|
| sm | 40rem | css |
| md | 48rem | css |
| lg | 64rem | css |
| xl | 80rem | css |
| 2xl | 96rem | css |

**Approach:** Use `@media (min-width: ...)` queries matching the breakpoints above.


---

## 10. Agent Prompt Guide

Use these as starting points when building new UI:

### Build a Card

```
Background: #ffcaca
Border: 1px solid var(--border)
Radius: 3.2px
Padding: 16px
Font: SFMono-Regular
No shadows — use borders and surface colors for depth.
```

### Build a Button

```
Primary: bg #dd7400, text white
Ghost: bg transparent, border var(--border)
Padding: 8px 16px
Radius: 3.2px
Hover: opacity 0.9 or lighter shade
Focus: ring with #dd7400
```

### Build a Page Layout

```
Background: #ffffff
Max-width: 96rem, centered
Grid: 4px base
Responsive: mobile-first, breakpoints from Section 9
```

### Build a Stats Card

```
Surface: #ffcaca
Label: #90a1b9 (muted, 12px, uppercase)
Value: #000000 (primary, 24-32px, bold)
Status: use success/warning/danger from Section 2
```

### Build a Form

```
Input bg: #ffffff
Input border: 1px solid var(--border)
Focus: border-color #dd7400
Label: #90a1b9 12px
Spacing: 16px between fields
Radius: 3.2px
```

### General Component

```
1. Read DESIGN.md Sections 2-6 for tokens
2. Colors: only from palette
3. Font: SFMono-Regular, type scale from Section 3
4. Spacing: 4px grid
5. Components: match patterns from Section 4
6. Elevation: flat, surface shifts
```
