# Interaction Reference

> Micro-interactions extracted from live DOM. Recreate these exactly for authentic feel.

## Coverage

| Component Type | Count | States Captured |
|----------------|-------|----------------|
| Role Button | 1 | default, hover, focus |

## Transition System

These transition declarations were extracted from interactive elements:

```css
transition: 0.1s;
```

Apply these to all interactive elements. Never invent new durations or easings.

## Role Button Interactions

### Role Button 1 — `Menu Aksesibilitas`

**States:**

- Default: `../screens/states/role-button-1-default.png`
- Hover: `../screens/states/role-button-1-hover.png`
- Focus: `../screens/states/role-button-1-focus.png`

**On hover:**

```css
/* transform: none → */ transform: matrix(1.1, 0, 0, 1.1, 0, 0);
```

**On focus:**

```css
/* box-shadow: none → */ box-shadow: rgba(0, 56, 255, 0.22) 0px 0px 0px 4px;
/* outline: rgb(0, 0, 0) none 3px → */ outline: rgb(0, 56, 255) solid 2px;
/* outline-color: rgb(0, 0, 0) → */ outline-color: rgb(0, 56, 255);
```

**Transition:** `0.1s`

## Interaction Rules

- Accent color `#dd7400` is used for focus rings, active states, and hover highlights
- Focus states use **outline** (not box-shadow) — always match the extracted focus ring
- Transition durations in use: `0.1s`
- Always respect `prefers-reduced-motion` — set all transitions to `0s` when enabled

