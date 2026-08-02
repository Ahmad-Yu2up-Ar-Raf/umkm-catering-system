<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Business & Brand Context (project "brain") · **Monorepo Root:** `../`
>
> [Monorepo Architecture](./architecture.md) · [Root Readme](../README.md) · [Frontend Architecture](../frontend/docs/architecture.md) · [Backend API Specs](../backend/docs/api-collection.md) · [Frontend Design Spec](../frontend/docs/design.md)

# Catering Nusantara — Brand & Business Context

> The single source of business truth for the "Catering Nusantara" platform (Dapur Bunda Catering). Read this before any product, content, or architecture work — it explains **who** the business is, **what** problem the software solves, **who** it serves, and **how** money is made. Technical readers should combine this with `docs/architecture.md` (structure) and `frontend/docs/design.md` (look & feel).

---

## 1. The Business

**Dapur Bunda Catering** — a home-based catering business in **Bogor, Indonesia**, operating since **2019** (PIC: **Ratna Kusuma**).

- **What it sells:** Indonesian home-style catering for events and daily consumption — rice boxes, snack boxes, tumpeng (cone rice), and prasmanan (buffet) packages.
- **Positioning:** "**Down to Earth**" — honest, home-cooked Nusantara flavors. Not fine-dining; not industrial catering. The brand promises the taste and feel of a good home kitchen.
- **Scale:** an UMKM (small business) — the software is deliberately sized for one kitchen, a handful of staff, and a few hundred orders.
- **Team (project):** Ahmad Yusuf Ar-Rafi (Back-End + Front-End), Denniz Rizki Attila (Back-End), Thoriq Azhar Raditya (Front-End).

## 2. The Core Problem

The business already sold successfully through **WhatsApp** — customers chatted an order, the owner manually calculated prices and wrote down records. The pain points:

1. **Manual arithmetic** — every order total was computed by hand (`(jumlah paket × harga) + lauk tambahan`). Errors happen, especially for large/event orders.
2. **Manual record-keeping** — no reliable order history, no invoice/receipt (`struk`) trail, no stock/capacity visibility.
3. **No product catalog** — potential customers couldn't see menus, prices, or photos before messaging; the owner re-explained menus one-by-one.
4. **Inconsistent product photos** — existing shots had clashing backgrounds (sage green, yellow, beige), hurting the brand's credibility and conversion.

**The software does not replace WhatsApp.** It makes WhatsApp the *point of conversion* while removing the manual arithmetic and record-keeping around it.

## 3. The Target Audience

**Primary: B2C event customers in the greater Bogor area** (including Cibinong, Sentul, Cileungsi, Depok) who order catering for:

- **Weddings (pernikahan)** — prasmanan & tumpeng
- **Corporate / office (kantor)** — nasi box, corporate prasmanan
- **Arisan / community gatherings** — snack box
- **Personal / small events** — tumpeng mini, nasi box

**Secondary: the owner/operator (admin)** — the internal user who runs the Mini POS: records orders, computes totals, issues receipts, manages products.

**Conversion model:** public visitors browse the catalog → build an order (portion calculator) → **hand off to WhatsApp chat** with the order details + estimated price → the admin confirms and finalizes in the Mini POS. No in-app payment gateway, no cart/checkout — WhatsApp is the cash register handshake.

## 4. The Product Catalog (5 Packages)

| Package | Type | Pricing anchor |
|---|---|---|
| Nasi Box Hemat | Per-portion rice box | Mid range; the **hero / best seller** |
| Prasmanan Pernikahan | Wedding buffet | Top range |
| Snack Box Arisan | Snack box | From **Rp18.000**/box |
| Tumpeng Mini | Per-package cone rice | **Rp250.000 per package of 10 portions** (`harga_per_porsi` = Rp25.000, `min_order` = 10) |
| Prasmanan Korporat | Corporate buffet | Corporate range |

Capacity varies from ~20 packages to ~1000 portions. See `docs/architecture.md` §4.1 for the pricing/capacity validation rules.

## 5. The Hybrid Platform Model

One database, two surfaces:

- **Public Site (anonymous)** — read-only catalog (`paket`, `galeri`) optimized for WhatsApp conversion: Home, About, Packages + Detail, Gallery, How to Order, Contact, FAQ.
- **Admin CMS + Mini POS (authenticated)** — the only surface that writes orders (`pesanan`): dashboard, product CRUD, order recording with automatic `total_harga` calculation, digital receipt (`nomor_struk`), order history.

**Non-negotiables:** `total_harga` is computed **server-side** only; `nomor_struk` is server-generated (`STR-YYYYMMDD-XXXX`); prices are snapshotted at order creation. The frontend displays previews only.

## 6. Brand & Visual Identity

- **Colors:** warm charcoal-black + cream + pure white.
- **Design reference:** [suasana.vercel.app](https://suasana.vercel.app) — calm, earthy, natural.
- **Photography standard:** the **Dapur Solo** lunchbox style — bright, clean, high-key, pure-white background, honest home-cooked look.
- **Rules:** **no stock photos** — only real client photos (or the consistent styled shoot). Product images must be visually uniform across all 5 packages.
- **Voice:** warm, local, trustworthy — "masakan rumah", not corporate marketing copy.

## 7. Success Metrics (North Stars)

1. **WhatsApp conversion** — % of catalog visitors who start a WhatsApp order.
2. **Order accuracy** — zero manual-arithmetic errors on `total_harga` / `nomor_struk`.
3. **Order history integrity** — every order recorded with a valid receipt and snapshot pricing.
4. **Brand consistency** — all product photos meet the uniform white-background standard.

## 8. How Agents Should Use This File

- **Content work** (SEO, copy, photos): use §3–§6 for audience, voice, and visual rules.
- **Architecture work**: pair with `docs/architecture.md` and `backend/docs/database.md`; respect the server-side computation rules in §5.
- **UI work**: pair with `frontend/docs/design.md`; never introduce hardcoded colors, stock photos, or corporate-catering aesthetics.
- **Scope discipline**: this is an UMKM system — every feature must justify its complexity against the WhatsApp-first model in §2.

## 9. Where Things Live (Repo Map)

- **Public catalog + Admin dashboard UI** → `/frontend` (React/Vite). Architecture: `frontend/docs/architecture.md`; look & feel: `frontend/docs/design.md`.
- **Business logic, database, API provider** → `/backend` (Laravel, Neon PostgreSQL). Architecture: `backend/docs/architecture.md`; schema: `backend/docs/database.md`.
- **API contract (endpoints/payloads/responses)** → `backend/docs/api-collection.md` (single source of truth; frontend references it).
- **End-to-end directory tree & communication flow** → `docs/architecture.md` §0.
