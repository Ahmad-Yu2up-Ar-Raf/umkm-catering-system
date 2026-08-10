# 1. Project Overview & Vision

# Project Overview & Vision

## Project Identity

**Catering Nusantara** is a hybrid F&B web platform built for **Dapur Bunda Catering** (Bogor, established 2019, PIC: Ratna Kusuma). The system serves two distinct surfaces from a single database:

- **Public Catalog** — A showcase website optimized for WhatsApp conversion (anonymous visitors browse packages → use portion calculator → checkout via WhatsApp deep-link)
- **Admin CMS + Mini POS** — Internal order management system with auto-calculation, invoice generation, and order history

## Core Business Problem

Dapur Bunda currently processes everything manually:

1. Customer chats via WhatsApp → owner manually calculates prices
2. Handwritten receipts → no digital backup
3. No order history tracking → difficult to measure business performance

**The system eliminates:** arithmetic errors, lost paper receipts, and guesswork in business decisions — while keeping WhatsApp as the primary sales channel.

## Business Goals (OKR-style)

1. Public catalog showcasing 20+ menu packages with filtering, search, and real-time portion calculator
2. Admin Mini POS that auto-calculates prices — input items → system generates total → prints invoice
3. Searchable digital order history — no more lost paper receipts
4. WhatsApp deep-link checkout — customer clicks → pre-filled message with package details + price
5. Dashboard with business intelligence: popular packages, monthly volume, revenue trends

## Target Audience

| Segment | Description | Needs |
| --- | --- | --- |
| **Public Visitors** | Individuals/families in Bogor/Jabodetabek looking for event catering (weddings, corporate, birthdays, arisan) | Browse packages, see pricing, easy WhatsApp checkout |
| **Admin Users** | Ratna Kusuma (owner) + 1-2 staff. Non-technical users | Intuitive UI, quick order entry, auto-calculation, simple reports |

## Client Data Snapshot (from Business Sheets)

- **Price range:** Rp18,000 (Snack Box) to Rp250,000 per package (Tumpeng Mini — 10 portions)
- **Categories:** Nasi Box, Prasmanan, Snack, Tumpeng
- **Event types:** Pernikahan, Kantor, Ulang Tahun, Arisan, Umum
- **Production capacity:** 20-1000 portions per event
- **Active since:** 2019

## Team & Roles

| Name | Role | Focus |
| --- | --- | --- |
| Ahmad Yusuf Ar-Rafi | Tech Lead / Full-Stack | Architecture, Backend API, Frontend core |
| Denniz Rizki Attila | Backend Developer | API endpoints, database, validation |
| Thoriq Azhar Raditya | Frontend Developer | UI components, pages, styling |

## Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Backend Framework | Laravel 13 (PHP 8.4) | API server, business logic |
| API Auth | Laravel Sanctum | SPA token-based authentication |
| Database | MySQL/MariaDB 8+ | Relational storage (4 tables) |
| Frontend | React 19 + Vite | SPA UI |
| UI Library | shadcn/ui (Radix) | Accessible UI primitives |
| Styling | Tailwind CSS v4 (OKLCH) | Utility-first design tokens |
| Server State | TanStack React Query | Caching, invalidation |
| HTTP Client | Ky | Lightweight fetch wrapper |
| UI State | Zustand | Local UI state only |
| Routing | React Router | Client-side SPA routing |
| Testing (BE) | Pest PHP | Unit + Feature tests |
| Testing (FE) | Vitest + Testing Library | Component tests |

## Repository

**GitHub:** [https://github.com/Ahmad-Yu2up-Ar-Raf/umkm-catering-system](https://github.com/Ahmad-Yu2up-Ar-Raf/umkm-catering-system)

**Project Board:** [https://github.com/users/Ahmad-Yu2up-Ar-Raf/projects/6](https://github.com/users/Ahmad-Yu2up-Ar-Raf/projects/6)