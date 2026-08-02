# SEO Foundation Plan — Catering Nusantara (Dapur Bunda Catering)

**Date:** 2026-08-01
**Project:** Catering Nusantara (Dapur Bunda Catering), domain cateringnusantara.id (under development)
**Status:** Phase 1 CLOSED — approved 2026-08-01. Phase 2 content briefs in progress.
**Authoritative inputs:** Notion "7. SEO Competitive Landscape — Catering Bogor"
(3aedbe64-a50a-819b-9325-e7536d46c633) + sibling pages 1 & 6 (client facts) +
`docs/architecture.md` §2/§4 + `frontend/docs/design.md`.

---

## 1. Tooling & Data Caveats (carry into every report)

1. **DataForSEO Labs keyword volume is UNAVAILABLE for the Indonesian market on this
   account.** `find_serp_competitors` was attempted for locations 2044 (country: "domain
   analytics not available"), 1004122 (Jakarta: en-only, then invalid), 1004190 (Bogor:
   invalid). **No working ID location. Do not retry this session.**
2. All competitor evidence is **first-hand local SERP + site-scrape**; ranking strength is
   **directional, not measured**. Validate once the site is live and GSC/SERP data exists.
3. Notion MCP returns 401 despite a valid token (stale env at server launch) — use the
   curl fallback documented in the workspace README.
4. Site-crawl audits (`get_audit_issues` / `get_audit_pages`) are **deferred** until
   cateringnusantara.id serves the public site (roadmap launch ~week 9–10).

## 2. Client Facts (from Notion, do not invent beyond these)

- PIC: **Ratna Kusuma** (owner), active since **2019**, Bogor.
- Prices: **Rp18.000** (Snack Box) → **Rp250.000 per paket 10 porsi** (Tumpeng Mini).
  Tumpeng Mini is priced per-paket; `harga_per_porsi` = Rp25.000, `min_order` = 10
  (docs/architecture.md §4.1). **Never display it as Rp250k per porsi.**
- Categories: Nasi Box, Prasmanan, Snack, Tumpeng. Events: Pernikahan, Kantor, Ulang
  Tahun, Arisan, Umum. Production capacity: **20–1000 porsi per acara**.
- Conversion: WhatsApp-first (wa.me deep links with pre-filled order message).

## 3. Strategy Summary

Three lanes, in priority order:

1. **Gap products** (fastest wins): Tumpeng Mini, Snack Box, Catering Kantor — no
   competitor owns them. Win with full menu + package pages, price transparency,
   WhatsApp-first CTAs.
2. **Core revenue** (mandatory): Nasi Box detail + catalog — competitive vs price players
   (Rp12k–20k); compete on "masakan rumah" positioning, not price.
3. **Local foundation**: GBP verification + optimization (categories, NAP, real photos,
   posts, Q&A, service area) + trust content (Tentang Kami: halal/tepercaya angle).

Keyword matrix, per-cluster competitors, and keyword→page map live in
`keywords/keyword-research-2026-08-01.md` (referenced, not duplicated).

## 4. Prioritized Build List (Phase 2, approved order)

| # | Brief | Target page (official sitemap) | Priority |
|---|-------|-------------------------------|----------|
| 1 | Tumpeng Mini | Detail Paket — Tumpeng Mini | P1 |
| 2 | Snack Box | Detail Paket — Snack Box | P2 |
| 3 | Nasi Box | Detail Paket — Nasi Box + Paket Katering katalog | P3 |
| 4 | Corporate / Kantor | Paket Katering (kategori_acara=Kantor) + Galeri + Cara Pemesanan | P4 |
| — | Location pages (Cibinong/Sentul/Cileungsi/Depok) | NEW pages — **brief only, PENDING client delivery-area confirmation** | — |
| — | Hero article ("catering bogor" / "catering pernikahan bogor") | NEW page — **brief only, PENDING blog go-ahead** | — |

## 5. Google Business Profile Plan (summary)

- Verify **Dapur Bunda Catering** profile. Primary category: Caterer; secondary: Catering
  food service.
- Consistent NAP (name/address/phone) matching the site — **needs client data** (see §7).
- Real local photos only (frontend/docs/design.md §5 — no stock). Posts weekly. Q&A seeded with the FAQ
  answers.
- Service-area: city-wide Bogor + sub-markets **only once client confirms delivery areas**.
- **Key intel: Zahwa Katering wins the local pack with just 4 reviews** — optimization
  signals (categories, NAP, posts, Q&A, proximity) beat review count. Dapur Bunda can
  win the pack with zero reviews if GBP hygiene is done right. Start review generation
  (WhatsApp QR ask) + Instagram hashtag cross-pollination (#cateringbogor,
  #cateringbogormurah, #paketpernikahanbogor).

## 6. Deferred Items

- Site-crawl audits (get_audit_issues / get_audit_pages) — until site is live.
- GSC connection (gsc/ folder) — once domain serves content.
- Live SERP validation of the directional opportunity matrix.

## 7. CLIENT DATA REQUEST — the real bottleneck (send in parallel)

Everything below blocks brief finalization or GBP. Do NOT fabricate these.

| # | Item | Blocks |
|---|------|--------|
| 1 | **Delivery areas** — Cibinong / Sentul / Cileungsi / Depok, or city-wide? Per-area minimums? | Location briefs (G cluster), GBP service area |
| 2 | **WhatsApp number + NAP** (full address, phone, hours) for GBP + site Kontak | All briefs (CTA), GBP, Kontak page |
| 3 | **Real product photos** — Tumpeng Mini, Snack Box, Nasi Box (+ galeri acara) | All detail-page briefs (frontend/docs/design.md §5: no stock) |
| 4 | **Go-ahead for blog/hero article section** | Hero brief (pending state) |
| 5 | **Full menu + per-item prices** per paket (Data Produk sheet) — exact menu_utama/menu_tambahan/fasilitas | Detail Paket briefs (placeholder fields today) |
| 6 | Instagram/social handles | Hashtag cross-pollination, Kontak page |

## 8. Open Questions

1. Are location landing pages + hero article in scope at all, or permanently out? (They
   stay PENDING until the client answers.)
2. Corporate/catering-kantor: standalone URL is a NEW page — current brief targets only
   official sitemap pages (katalog filter + galeri + pemesanan). OK to keep it that way?
3. Price display for Nasi Box: per-porsi confirmed? Snack Box min-order?
