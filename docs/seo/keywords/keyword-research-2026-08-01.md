# Keyword Research — Catering Bogor (Catering Nusantara)

**Date:** 2026-08-01
**Project:** Catering Nusantara
**Status:** Phase 1 deliverable — approved 2026-08-01

---

## Method & Caveat (read first)

- Seed set built from the Notion SEO page gap table + client products (docs/architecture.md §4) +
  spelling / location / price / trust variants.
- **DataForSEO Labs keyword volume is UNAVAILABLE for the Indonesian market on this
  account.** `find_serp_competitors` was attempted for locations 2044 (country), 1004122
  (Jakarta), 1004190 (Bogor) — no working Indonesia location exists. **Do not retry this
  session; do not re-run `find_serp_competitors` for ID.**
- Competitor coverage below is **first-hand local SERP + site-scrape evidence** from
  `competitors/bogor-catering-landscape.md` and `competitors/pricing-intel.md`.
- **Ranking strength is directional, not measured.** Treat all "winnable?" ratings as
  hypotheses to validate once cateringnusantara.id is live and GSC/SERP data exists.

---

## 1. Seed Keyword Set (8 clusters)

| # | Cluster | Keywords |
|---|---------|----------|
| A | Core head | katering bogor, catering bogor, catering bogor terdekat, jasa katering bogor |
| B | Nasi Box (transactional) | nasi box bogor, nasi box murah bogor, harga nasi box bogor, nasi kotak bogor, nasi box pernikahan bogor, nasi box kantor bogor, nasi box ulang tahun bogor, pesan nasi box bogor, katering nasi box bogor |
| C | Prasmanan | catering prasmanan bogor, prasmanan pernikahan bogor, harga prasmanan bogor |
| D | Tumpeng / Tumpeng Mini | tumpeng bogor, tumpeng mini bogor, catering tumpeng bogor, tumpeng mini murah bogor, harga tumpeng mini bogor, pesan tumpeng bogor |
| E | Snack Box / Coffee Break | snack box bogor, snack box murah bogor, snack kotak bogor, snack box kantor bogor, coffee break bogor |
| F | Events | catering pernikahan bogor, katering pernikahan bogor, paket catering pernikahan bogor, catering kantor bogor, catering ulang tahun bogor, catering arisan bogor, catering aqiqah bogor, catering khitanan bogor, paket wedding bogor |
| G | Sub-markets (PENDING delivery-area) | catering cibinong, katering cibinong, nasi box cibinong, catering sentul, catering cileungsi, catering depok, nasi box depok |
| H | Price & trust | catering murah bogor, katering murah bogor, catering halal bogor, catering tepercaya bogor, catering pesan antar bogor |

> Spelling variants tracked: "katering" (K) vs "catering" (C) — both are searched by
> Bogor users; competitors optimize almost exclusively for "catering". Cover both.

---

## 2. Per-Cluster SERP Competitors (first-hand evidence)

| Cluster | Domains holding the SERP | Evidence source |
|---------|--------------------------|-----------------|
| A. Core head | Jagarasa (cateringbogor.or.id + jagarasa.com) — keyword domain network + blog; Niezar /catering-bogor/ landing | landscape.md |
| B. Nasi Box | azzahra-catering.com (from Rp12k), annasyacatering.com (from Rp15k), niezarcatering.com (from Rp20k), bogorkatering.com (12,000 box/day capacity) | landscape.md + pricing-intel.md |
| C. Prasmanan | Jagarasa (35–55k/pax, 200 pax min) | landscape.md |
| D. Tumpeng | Weak — only restaurants locally (Dapur Solo, Kuliner Mbak Par) | landscape.md |
| E. Snack Box | Thin everywhere; no dedicated owner | landscape.md |
| F. Events | Jagarasa blog for pernikahan; nobody owns kantor / ulang tahun / aqiqah | landscape.md |
| G. Sub-markets | Underserved — Jagarasa/Niezar/azzahra/annasya own Puncak & Cisarua, NOT Cibinong/Sentul/Cileungsi/Depok | landscape.md |
| H. Price/trust | "catering murah bogor" partly owned; "catering halal bogor" only Niezar (Halal MUI) | landscape.md |

---

## 3. Opportunity Matrix

| Cluster | Intent | Competition | Winnable? | Rationale |
|---------|--------|-------------|-----------|-----------|
| D. Tumpeng Mini | Commercial | Weak | **HIGH** | Product live (Rp250k/paket 10 porsi); no "catering tumpeng bogor" owner |
| E. Snack Box | Transactional | Thin | **HIGH** | Product live (Rp18k); full menu page + package landing wins |
| F. Catering kantor | Commercial | No owner | **HIGH** | Capacity 20–1000 porsi fits office/seminar demand |
| F. Catering ulang tahun | Commercial | Weak | **HIGH** | Birthday segment underserved |
| G. Sub-markets | Local | Underserved | **MED-HIGH** | City-wide delivery claim; blocked on client delivery-area confirmation |
| B. Nasi Box | Transactional | Price players | **MED** | Core revenue; compete on "masakan rumah" + transparency, not price war |
| H. Price/trust | Decision | Partly owned | **MED** | Own the transparency/trust angle |
| A. Core head | Commercial | Jagarasa | **LOW-MED** | Long-term; win via GBP + content depth, not head-to-head |
| C. Prasmanan | Commercial | Jagarasa | **LOW-MED** | Jagarasa 200-pax minimum = small-event gap Catering Nusantara can own |

---

## 4. Keyword → Page Map (official sitemap, docs/architecture.md §2)

| Page | Keywords | Intent |
|------|----------|--------|
| Beranda | A: katering bogor, catering bogor, catering bogor terdekat | Commercial |
| Paket Katering (katalog) | paket katering bogor + umbrella price terms | Commercial |
| Detail Paket — Nasi Box | B | Transactional |
| Detail Paket — Prasmanan | C | Transactional |
| Detail Paket — Tumpeng Mini | D | Transactional |
| Detail Paket — Snack Box | E | Transactional |
| Tentang Kami | H: catering halal bogor, catering tepercaya bogor | Trust |
| Cara Pemesanan | H: catering pesan antar bogor, cara pesan catering bogor | Commercial |
| Kontak | G (sub-markets, PENDING), catering dekat saya | Local |
| Galeri Acara | F (pernikahan, ulang tahun, arisan, kantor) | Commercial |
| FAQ | Long-tail: berapa harga nasi box bogor, minimal order catering bogor, bisa pesan dadakan atau tidak | Informational |

**Proposed NEW pages (NOT in sitemap — briefs only, tagged PENDING, see Phase 2):**
1. Location landing pages (Cluster G) — require client delivery-area confirmation
2. Hero service-hub article (Cluster A / "catering pernikahan bogor") — requires go-ahead for blog section
