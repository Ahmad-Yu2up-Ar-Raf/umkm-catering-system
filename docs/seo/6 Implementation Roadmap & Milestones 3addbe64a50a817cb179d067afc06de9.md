# 6. Implementation Roadmap & Milestones

# Implementation Roadmap & Milestones

## Phase 1: Foundation (Week 1-2)

**Goal:** Working database + auth + basic API skeleton

### Backend Tasks

- [ ]  **Migrations** — Create `paket`, `galeri`, `pesanan` tables with foreign keys and proper column types
- [ ]  **Models** — Create Paket, Galeri, Pesanan models with casts for JSON columns and relationships
- [ ]  **Seeders** — Seed database with 10-15 sample packages using real client data (from Data Produk sheet)
- [ ]  **Auth** — Verify Sanctum login/logout/register endpoints work correctly
- [ ]  **Services** — Create `HargaService` (price calculation + snapshot logic) and `StrukService` (invoice number generator)
- [ ]  **Form Requests** — Create validation for PaketRequest (all JSON fields validated) and PesananRequest
- [ ]  **Tests** — Auth feature tests, HargaService unit test (incl. Tumpeng Mini edge case)

### Frontend Tasks

- [ ]  **Router** — Set up all routes per sitemap with public vs admin guards
- [ ]  **Auth Store** — Zustand auth store + login/logout flow
- [ ]  **Theme** — Configure Tailwind v4 OKLCH colors + font families in index.css
- [ ]  **shadcn/ui** — Init and add core components: Button, Card, Input, Dialog, Table, Badge, etc.
- [ ]  **Layout** — Navigation header, footer, admin sidebar layout
- [ ]  **API Client** — Ky instance with token injection and 401 auto-redirect

---

## Phase 2: Public Catalog (Week 3-4)

**Goal:** Complete public-facing website with catalog + calculator + WhatsApp checkout

### Backend Tasks

- [ ]  `GET /api/v1/paket` — List with filters (category, event type, price range, search)
- [ ]  `GET /api/v1/paket/{id}` — Detail with full JSON fields
- [ ]  `GET /api/v1/paket/best-seller` — Featured packages for homepage
- [ ]  `GET /api/v1/galeri` — Gallery endpoint
- [ ]  Rate limiting on public endpoints

### Frontend Tasks

- [ ]  **Beranda** — Hero banner + best-seller grid + keunggulan section + CTA WhatsApp
- [ ]  **Katalog Paket** — Grid/list view with filter sidebar (kategori, harga range, search)
- [ ]  **Detail Paket** — Full package view with menu list, facilities, large image, WhatsApp CTA
- [ ]  **Kalkulator Porsi** — Real-time price preview on detail page
- [ ]  **Galeri** — Photo grid with lightbox
- [ ]  **Tentang Kami** — Company profile / sejarah
- [ ]  **Kontak** — Address, map embed, social links, contact form (static)
- [ ]  **Cara Pemesanan** — Step-by-step ordering guide
- [ ]  **Loading/Error/Empty** — States for every data-driven component

---

## Phase 3: Admin CMS + Mini POS (Week 5-6)

**Goal:** Admin can log in, manage products, and record orders

### Backend Tasks

- [ ]  Admin package CRUD endpoints (all with Form Request validation + image upload)
- [ ]  Gallery CRUD endpoints with image upload
- [ ]  Order creation with auto-calculate (HargaService integration)
- [ ]  Order listing with pagination + filters (date, status, search)
- [ ]  Order status updates
- [ ]  Invoice/receipt generation endpoint
- [ ]  Dashboard stats endpoint (counts, revenue, popular items)

### Frontend Tasks

- [ ]  **Dashboard** — Stats cards, recent orders table, quick actions
- [ ]  **Kelola Produk** — CRUD table with create/edit dialog + image upload
- [ ]  **Pencatatan Pesanan** — Order form with: pilih paket → input jumlah → auto-calculate preview → save
- [ ]  **Riwayat Pesanan** — Filterable table of all orders with status badges
- [ ]  **Detail Pesanan** — Full order view + invoice/struk preview + print button
- [ ]  **Galeri Admin** — Upload/manage gallery photos

---

## Phase 4: Polish & QA (Week 7-8)

**Goal:** Production-ready with tests and optimizations

### Backend Tasks

- [ ]  Full Pest feature tests: all API endpoints, validation rules, auth
- [ ]  Seed 20+ packages with real client data
- [ ]  Error handling middleware for consistent API responses
- [ ]  API documentation (can be basic README)
- [ ]  Performance check: N+1 query prevention

### Frontend Tasks

- [ ]  Responsive: test on mobile, tablet, desktop
- [ ]  Accessibility: keyboard nav, screen reader testing, contrast check
- [ ]  Error boundaries for each page
- [ ]  SEO: meta tags, OG images, semantic HTML
- [ ]  Performance: lazy loading images, code splitting routes
- [ ]  Loading skeletons for all data pages

---

## Phase 5: Launch (Week 9-10)

**Goal:** Deploy to production server

- [ ]  Production server setup (PHP-FPM, Nginx, MySQL, Node)
- [ ]  SSL certificate (Let's Encrypt)
- [ ]  Environment configuration
- [ ]  Database migration + seed
- [ ]  Frontend build + deploy
- [ ]  CORS configuration for production
- [ ]  Rate limiting tuned
- [ ]  Backups configured (daily DB dump)
- [ ]  Monitoring (basic: error logging, uptime check)
- [ ]  WhatsApp number verified
- [ ]  Final walkthrough with Ratna Kusuma (owner)
- [ ]  Training session (1 hour)

---

## Future Enhancements (Post-MVP)

These are tracked but NOT in scope for the current build:

- [ ]  **Testimoni management** — Separate admin module for customer reviews with star ratings
- [ ]  **FAQ management** — Editable Q&A list
- [ ]  **PDF invoice download** — Instead of just browser print
- [ ]  **Order notifications** — WhatsApp notification to admin when order is created
- [ ]  **Advanced reporting** — Revenue charts, popular items analytics, monthly trends
- [ ]  **Customer database** — Track repeat customers linked to orders
- [ ]  **Multi-admin** — Multiple admin accounts with role permissions
- [ ]  **Online payment** — Integration with QRIS / bank transfer confirmation
- [ ]  **Stock management** — Real-time ingredient tracking linked to production capacity

---

## Dependency Graph (Critical Path)

```
Week 1: Database Schema → Models → Auth
              ↓
Week 2: Public API endpoints ← Seeders
              ↓
Week 3: Public Catalog Pages (Frontend)
              ↓
Week 4: Admin CRUD API ← Order Service
              ↓
Week 5: Admin Pages (Dashboard + Produk + Pesanan)
              ↓
Week 6: Polish + Tests
```