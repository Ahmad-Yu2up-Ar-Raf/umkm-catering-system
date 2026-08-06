---
name: motion-orchestration
description: Motion discipline for Catering Nusantara. GSAP (useGSAP + ScrollTrigger) is primary for public catalog pages; Framer Motion (AnimatePresence) is code-split and reserved for admin POS mount/unmount transitions. Enforces "one signature moment per viewport", prefers-reduced-motion gating, and rAF idle-pause so animation never bottlenecks the UI.
---

# Motion Orchestration — Catering Nusantara

Budget approved: **GSAP primary + Framer Motion code-split for the admin POS only.** WebGPU is deferred (experience layer later).

## Rules

1. **One signature motion moment per viewport.** Everything else stays static or hover-subtle (150–300ms). Never ship infinite-loop micro-animations everywhere.
2. **GSAP = public catalog.** Use the official local skills (`gsap-react`, `gsap-timeline`, `gsap-scrolltrigger`) with `useGSAP()` from `@gsap/react`: pass a `scope` ref, let cleanup be automatic. Register plugins once.
   ```tsx
   import { useGSAP } from "@gsap/react";
   useGSAP(() => { gsap.from(el, { opacity: 0, y: 24, stagger: 0.08 }); }, { scope: ref });
   ```
3. **Framer Motion = admin POS only**, loaded via code-split chunks so public pages never pay the ~40KB. Use `AnimatePresence` for dialog/sheet/drawer mount/unmount; keep durations 150–300ms.
4. **`prefers-reduced-motion` gate (mandatory).** Respect the OS setting — skip transform animations when reduced motion is requested. Use a `use-reduced-motion` hook (`matchMedia('(prefers-reduced-motion: reduce)')`).
5. **rAF hygiene.** Pause scroll/render loops on `document.hidden`; avoid animating width/height (use transforms); no layout thrash in a tween loop.
6. **No motion on trust-critical admin actions** (saving an order) — instant feedback beats decoration.

## Where motion lives (proposed tree, BUILD later)

- `src/hooks/use-reduced-motion.ts` — OS reduced-motion gate
- `src/hooks/use-motion-prefs.ts` — motion-intensity flag tied to taste dial
- `src/components/motion/reveal.tsx` — ScrollTrigger reveal wrapper (GSAP)
- `src/components/motion/stagger.tsx` — entry stagger wrapper (GSAP)
- `src/components/motion/pos-transition.tsx` — Framer `AnimatePresence` wrapper (admin only)

## Verify

- `prefers-reduced-motion` → animations become static (verify visually in the browser).
- Visual check: motion present but not overwhelming; no jank on 60fps — verified manually by the user in the browser.
