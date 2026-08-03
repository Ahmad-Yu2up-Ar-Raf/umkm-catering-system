# Product

## Register

brand — consumer-facing catering catalog (conversion to WhatsApp), with an internal product surface (admin CMS / Mini POS).

## Business Identity

<!-- TODO: address sub-district needs manual verification by the business owner -->
- **Brand:** Catering Nusantara
- **Owner / PIC:** Eva Rudianti (Ibu Eva)
- **Established:** 2024
- **Address:** Jln. Kapten Yusuf gang Purnama, Taman Sari, Bogor
- **WhatsApp / Phone:** 08561155113
- **Email:** Waroengpecelayam99@gmail.com

## Users

Indonesian families and event organizers in Bogor, Jakarta, and surrounding areas who need catering for weddings, private events, corporate meetings, trainings, and gala functions. They are planning a meaningful moment and want trusted, home-quality food — not a faceless corporate vendor. Internal users: the catering team operating the admin CMS / Mini POS to manage paket, gallery, and orders.

## Product Purpose

Catering Nusantara sells the taste of "home cooking" with three generations of craft. The public catalog helps visitors discover paket, understand what's included, and start an order conversation on WhatsApp with zero friction. The admin surface keeps the catalog, gallery, and orders in one reliable place. Success = a visitor feels the warmth and trust of a family kitchen and reaches out; an admin can run the business without friction.

## Brand Personality

Homey, warm, trustworthy, and down-to-earth — the kitchen table, not the banquet hall. Expert in craft but never stiff or corporate. Speaks like a family that has been cooking for three generations: confident, generous, and calm. Three-word personality: **warm, local, trusted**.

## Anti-references

- Cold corporate catering: sterile, hotel-banquet, institutional.
- Generic AI-slop SaaS: Inter/sans-only, purple-to-blue gradients, glassmorphism everywhere, glowing particles, bounce easing, card-in-card.
- Generic stock photography — use real client assets or warm, homey HD photography matching the OKLCH cream/amber palette.
- Cold blue/grey palettes, pure black/gray, "Elevate / Seamless / Delight" copy clichés, emojis as icons.

## Design Principles

1. **Homey, not stiff** — rounded, warm, approachable; comfort over polish-for-its-own-sake.
2. **Local, not generic** — subtle Nusantara textures (woven bamboo, banana leaf, thin batik) as accents, never dominant.
3. **One signature detail per surface** — spend boldness in exactly one place; everything else stays calm.
4. **Natural photography** — real food, real moments, warm light; client assets from `../../assets/main` first.
5. **Purposeful motion** — one moment per viewport, 150–300ms, `prefers-reduced-motion` respected; GSAP primary, Framer code-split for the admin POS.
6. **Calm density** — airy, readable, editorial warmth (taste dials pinned VARIANCE 5 / MOTION 4 / DENSITY 3).

## Accessibility & Inclusion

Baseline: WCAG 2.1 AA. Contrast checked against the OKLCH tokens, keyboard-navigable with visible focus, `prefers-reduced-motion` respected for every animation, semantic HTML first with ARIA as supplement. Copy in warm, plain Indonesian that sounds like a family speaking — not marketing-speak.

## Design System

- Tokens: `src/index.css` (OKLCH warm cream/amber, light + `.dark`).
- Contract: `docs/design.md` (Stitch-9-compatible) + `design-system/MASTER.md` + `design-system/pages/`.
- Reference benchmarks: `design-system/references/suasana-design/` (visual) and `design-system/references/catering-nusantara-design/` (self-fingerprint).
