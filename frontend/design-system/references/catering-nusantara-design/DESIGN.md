# Catering Nusantara DESIGN.md

> Auto-generated design system — reverse-engineered via static analysis by skillui.
> Frameworks: None detected
> Colors: 0 · Fonts: 1 · Components: 27
> Icon library: not detected · State: not detected
> Primary theme: light · Dark mode toggle: yes · Motion: subtle

---

## 1. Visual Theme & Atmosphere

This is a **light-themed** interface with a neutral, approachable feel. The light background emphasizes content clarity. Typography uses **sans-serif** throughout — a clean, modern choice that maintains consistency. Spacing follows a **4px base grid** (compact density), with scale: 4, 8, 12, 16, 20, 24, 32, 40px. Motion is subtle — smooth transitions (150-300ms) ease state changes without drawing attention.

---

## 2. Color Palette & Roles

No colors detected in the project.

---

## 3. Typography Rules

**Font Stack:**
- **sans-serif** — Heading 1, Heading 2, Heading 3, Body, Caption

| Role | Font | Size | Weight |
|---|---|---|---|
| Heading 1 | sans-serif | 48px / 3rem | 700 |
| Heading 2 | sans-serif | 32px / 2rem | 600 |
| Heading 3 | sans-serif | 24px / 1.5rem | 600 |
| Body | sans-serif | 16px / 1rem | 400 |
| Caption | sans-serif | 12px / 0.75rem | 400 |

**Typographic Rules:**
- Use **sans-serif** for all text — do not mix font families
- Maintain consistent hierarchy: no more than 3-4 font sizes per screen
- Headings use bold (600-700), body uses regular (400)
- Line height: 1.5 for body text, 1.2 for headings
- Use color and opacity for secondary hierarchy, not additional font sizes


---

## 4. Component Stylings

### Layout (2)

**Button** — `components/ui/button.tsx`
- Variants: `variant`, `default`, `hover`, `outline`, `expanded`, `secondary`, `ghost`, `dark`, `destructive`, `visible`, `link`, `size`
- Props: `variant`, `size`, `className`
- Key Styles: `rounded-4xl`, `bg-clip-padding`, `text-sm`, `font-medium`, `select-none`
- Animation: tw-transitions: transition-all

```tsx
<Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }
```

**Button** — `components/ui/fragments/shadcn-ui/button.tsx`
- Variants: `variant`, `default`, `hover`, `outline`, `expanded`, `secondary`, `ghost`, `dark`, `destructive`, `visible`, `link`, `size`
- Props: `variant`, `size`, `className`
- Key Styles: `rounded-4xl`, `bg-clip-padding`, `text-sm`, `font-medium`, `select-none`
- Animation: tw-transitions: transition-all

```tsx
<Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }
```

### Navigation (3)

**Drawer** — `components/ui/fragments/shadcn-ui/drawer.tsx`
- Key Styles: `rounded-full`, `bg-muted`, `mx-auto`, `text-sm`, `font-heading`, `group-data-[vaul-drawer-direction=bottom]/drawer-content:block`
- Animation: tw-animate-in, tw-animate-out

```tsx
<DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/80 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
```

**Table** — `components/ui/fragments/shadcn-ui/table.tsx`
- Key Styles: `bg-muted/50`, `px-3`, `text-sm`, `font-medium`, `hover:bg-muted/50`
- Animation: tw-transitions: transition-colors

```tsx
<div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className
```

**Tabs** — `components/ui/fragments/shadcn-ui/tabs.tsx`
- Variants: `variant`, `default`, `line`
- Props: `variant`
- Key Styles: `rounded-4xl`, `gap-2`, `text-sm`, `font-medium`, `group-data-horizontal/tabs:h-9`
- Animation: tw-transitions: transition-all, transition-opacity

```tsx
<TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
```

### Data Display (3)

**Badge** — `components/ui/fragments/shadcn-ui/badge.tsx`
- Variants: `variant`, `default`, `hover`, `secondary`, `destructive`, `visible`, `dark`, `outline`, `ghost`, `link`
- Props: `variant`
- Key Styles: `rounded-4xl`, `gap-1`, `text-xs`, `font-medium`
- Animation: tw-transitions: transition-all

```tsx
<Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }
```

**Card** — `components/ui/fragments/shadcn-ui/card.tsx`
- Variants: `default`, `sm`
- Key Styles: `rounded-2xl`, `bg-card`, `gap-(--card-spacing)`, `text-sm`, `font-heading`

```tsx
<div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing
```

**Tooltip** — `components/ui/fragments/shadcn-ui/tooltip.tsx`
- Key Styles: `rounded-[2px]`, `bg-foreground`, `gap-1.5`, `text-xs`
- Animation: tw-animate-in, tw-animate-out

```tsx
<TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
```

### Data Input (5)

**Checkbox** — `components/ui/fragments/shadcn-ui/checkbox.tsx`
- Key Styles: `rounded-[6px]`, `border-input`, `group-has-disabled/field:opacity-50`
- Animation: tw-transitions: transition-shadow, transition-none

```tsx
<CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[6px] border border-input transition-shadow outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        className
```

**DropdownMenu** — `components/ui/fragments/shadcn-ui/dropdown-menu.tsx`
- Variants: `default`, `destructive`
- Key Styles: `rounded-2xl`, `bg-popover`, `ml-auto`, `text-sm`, `shadow-2xl`, `pointer-events-none`
- Animation: tw-animate-in, tw-animate-out, tw-transitions: duration-100

```tsx
<DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
```

**Input** — `components/ui/fragments/shadcn-ui/input.tsx`
- Key Styles: `rounded-4xl`, `border-input`, `bg-input/30`, `px-3`, `text-base`, `disabled:pointer-events-none`
- Animation: tw-transitions: transition-colors

```tsx
<input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
```

**Select** — `components/ui/fragments/shadcn-ui/select.tsx`
- Variants: `sm`, `default`
- Key Styles: `rounded-4xl`, `border-input`, `bg-input/30`, `p-1`, `text-sm`, `shadow-2xl`, `pointer-events-none`
- Animation: tw-animate-none, tw-animate-in, tw-animate-out

```tsx
<SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className
```

**Textarea** — `components/ui/fragments/shadcn-ui/textarea.tsx`
- Key Styles: `rounded-xl`, `border-input`, `bg-input/30`, `px-3`, `text-base`, `disabled:cursor-not-allowed`
- Animation: tw-transitions: transition-colors

```tsx
<textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-xl border border-input bg-input/30 px-3 py-3 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
```

### Feedback (1)

**Skeleton** — `components/ui/fragments/shadcn-ui/skeleton.tsx`
- Key Styles: `rounded-xl`, `bg-muted`
- Animation: tw-animate-pulse

```tsx
<div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-xl bg-muted", className
```

### Overlay (3)

**Dialog** — `components/ui/fragments/shadcn-ui/dialog.tsx`
- Key Styles: `rounded-4xl`, `bg-black/80`, `gap-6`, `text-sm`, `font-heading`
- Animation: tw-animate-in, tw-animate-out, tw-transitions: duration-100

```tsx
<DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/80 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
```

**Popover** — `components/ui/fragments/shadcn-ui/popover.tsx`
- Key Styles: `rounded-2xl`, `bg-popover`, `gap-4`, `text-sm`, `font-medium`, `shadow-2xl`
- Animation: tw-animate-in, tw-animate-out, tw-transitions: duration-100

```tsx
<PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 flex w-72 origin-(--radix-popover-content-transform-origin
```

**Sheet** — `components/ui/fragments/shadcn-ui/sheet.tsx`
- Variants: `top`, `right`, `bottom`, `left`
- Key Styles: `bg-black/80`, `gap-1.5`, `text-sm`, `font-heading`, `shadow-lg`
- Animation: tw-animate-in, tw-animate-out, tw-transitions: duration-100, duration-200, ease-in-out

```tsx
<SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/80 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
```

### Typography (1)

**Label** — `components/ui/fragments/shadcn-ui/label.tsx`
- Key Styles: `gap-2`, `text-sm`, `font-medium`, `select-none`

```tsx
<LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
```

### Other (9)

**ThemeProvider** — `components/theme-provider.tsx`
- Variants: `dark`, `light`, `system`
- Props: `children`, `defaultTheme`, `storageKey`, `disableTransitionOnChange`
- State: useState, useContext

**LoginBlock** — `components/ui/core/block/auth/login-block.tsx`

```tsx
<div>LoginBlock</div>
```

**ContactBlock** — `components/ui/core/block/contact/contact-block.tsx`

```tsx
<div>ContactBlock</div>
```

**Separator** — `components/ui/fragments/shadcn-ui/separator.tsx`
- Key Styles: `bg-border`

```tsx
<SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
```

**Sonner** — `components/ui/fragments/shadcn-ui/sonner.tsx`
- Animation: tw-animate-spin

```tsx
<Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
```

**DashboardPage** — `pages/admin/dashboard-page.tsx`

```tsx
<div>DashboardPage</div>
```

**LoginPage** — `pages/auth/login-page.tsx`

**ContactPage** — `pages/contact/contact-page.tsx`

*...and 1 more other components.*



---

## 5. Layout Principles

- **Base spacing unit:** 4px
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- **Border radius:** 12px, 16px

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


---

## 7. Animation & Motion

This project uses **subtle motion**. Transitions smooth state changes without demanding attention.

### CSS Animations

- `@keyframes animate-in`
- `@keyframes animate-out`
- `@keyframes animate-none`
- `@keyframes animate-pulse`
- `@keyframes animate-spin`

### Animated Components

- **Button**: tw-transitions: transition-all
- **Badge**: tw-transitions: transition-all
- **Button**: tw-transitions: transition-all
- **Checkbox**: tw-transitions: transition-shadow, transition-none
- **Dialog**: tw-animate-in, tw-animate-out, tw-transitions: duration-100

### Motion Guidelines

- Duration: 150-300ms for micro-interactions, 300-500ms for page transitions
- Easing: `ease-out` for enters, `ease-in` for exits
- Always respect `prefers-reduced-motion`


---

## 8. Do's and Don'ts

### Do's

- Use **sans-serif** for all UI text
- Follow the **4px** spacing grid for all margins, padding, and gaps
- Use border and background shifts for elevation — not shadows
- Use border-radius from the scale: 12px, 16px
- Reuse existing components from Section 4 before creating new ones
- Always use CSS variables for colors — never hardcode hex
- Test both light and dark modes for contrast

### Don'ts

- Don't introduce colors outside this palette — extend the design tokens first
- Don't mix font families — use sans-serif consistently
- Don't use arbitrary spacing values — stick to multiples of 4px
- Don't add box-shadow — this design system uses flat elevation
- Don't use gradients — the design uses solid colors only
- Don't use arbitrary border-radius values — pick from the defined scale
- Don't duplicate component patterns — check Section 4 first

### Anti-Patterns (detected from codebase)

- No box-shadow on any element
- No gradient backgrounds
- No zebra striping on tables/lists


---

## 9. Responsive Behavior

No breakpoints detected. Consider adding responsive breakpoints to the design system.

---

## 10. Agent Prompt Guide

Use these as starting points when building new UI:

### Build a Card

```
Background: var(--surface)
Border: 1px solid var(--border)
Radius: 16px
Padding: 16px
Font: sans-serif
No shadows — use borders and surface colors for depth.
```

### Build a Button

```
Primary: bg var(--accent), text white
Ghost: bg transparent, border var(--border)
Padding: 8px 16px
Radius: 16px
Hover: opacity 0.9 or lighter shade
Focus: ring with var(--accent)
```

### Build a Page Layout

```
Background: var(--background)
Max-width: 1280px, centered
Grid: 4px base
Responsive: mobile-first, breakpoints from Section 9
```

### Build a Stats Card

```
Surface: var(--surface)
Label: var(--text-muted) (muted, 12px, uppercase)
Value: var(--text-primary) (primary, 24-32px, bold)
Status: use success/warning/danger from Section 2
```

### Build a Form

```
Input bg: var(--background)
Input border: 1px solid var(--border)
Focus: border-color var(--accent)
Label: var(--text-muted) 12px
Spacing: 16px between fields
Radius: 16px
```

### General Component

```
1. Read DESIGN.md Sections 2-6 for tokens
2. Colors: only from palette
3. Font: sans-serif, type scale from Section 3
4. Spacing: 4px grid
5. Components: match patterns from Section 4
6. Elevation: flat, surface shifts
```
