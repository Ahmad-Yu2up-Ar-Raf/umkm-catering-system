# 4. Development Standards & Workflow

# Development Standards & Workflow

## AI Agent Rules (for OpenCode)

### Backend Rules (Laravel)

1. **Authentication:** Laravel Breeze for auth scaffolding. Sanctum for API tokens consumed by React SPA. Not session cookies.
2. **JSON Validation:** All JSON fields (`menu_utama`, `menu_tambahan`, `fasilitas_termasuk`, `detail_tambahan`) MUST use Laravel Form Requests with type/shape validation. Never accept raw arrays.
3. **Total Harga Calculation:** MUST be calculated server-side (Service class or Model observer). NEVER accept from client. Formula: `(jumlah_paket × harga_paket_satuan) + biaya_tambahan`. `harga_paket_satuan` is a SNAPSHOT copied at order creation, not re-queried on read.
4. **Nomor Struk:** Server-generated only. Format: `STR-YYYYMMDD-XXXX` (daily sequential 4-digit counter).
5. **No new tables** beyond the 4 core (`users`, `paket`, `galeri`, `pesanan`) without explicit instruction. Optional future tables (`testimoni`, `faq`) are NOT approved yet.
6. **Tumpeng Mini Rule:** Price per package (Rp250,000/10 portions). Store Rp25,000 as `harga_per_porsi`. `min_order=10` carries "per package" semantics.

### Frontend Rules (React + Vite)

1. **UI Components:** Use shadcn/ui primitives (Radix). Never build custom if equivalent exists.
2. **State Management:** Zustand for LOCAL UI state only (dialog status, active filters). NOT for server data.
3. **Server Data:** TanStack React Query for all API fetching (caching + invalidation). Ky for HTTP client.
4. **Routing:** React Router per sitemap. Include routes for Tentang Kami, Cara Pemesanan, Kontak, FAQ.
5. **Price Calculator:** Frontend preview is for UX only. Final calculation MUST be re-validated server-side.
6. **Styling:** Use design tokens from `DESIGN.md`. Never hardcode hex colors in components.

### Forbidden Actions

- ❌ Don't change database schema without explicit instruction
- ❌ Don't calculate/save `total_harga` client-side as final value
- ❌ Don't hardcode colors/fonts outside design tokens
- ❌ Don't override shadcn/ui core files — re-theme via Tailwind config
- ❌ Don't add pages/routes outside the official sitemap
- ❌ Don't use stock photos if client's real photos are available

## Git Workflow

### Branch Strategy

```
main
  ├── feat/nama-fitur        (new features)
  ├── fix/nama-bug           (bug fixes)
  └── chore/nama-tugas       (setup, refactor, docs)
```

**Rules:**

- `main` is PROTECTED — no direct pushes. Pull Request only.
- 1 task = 1 branch. Never 2 tasks in 1 branch.
- Delete branch after merge.

### Daily Workflow

```bash
# 1. Pull latest main
git checkout main && git pull origin main

# 2. Create feature branch
git checkout -b feat/nama-fitur

# 3. Code, commit regularly (every logical change = 1 commit)
git add <files> && git commit -m "feat: add X feature"

# 4. Push branch
git push -u origin feat/nama-fitur

# 5. Create PR → assign reviewer → squash & merge → delete branch
```

### Commit Message Format

```
<type>: <pesan singkat>

feat: add API endpoint public catalog
fix: perbaiki kalkulasi total harga di pesanan
chore: setup tailwind v4 theme tokens
refactor: pindah logic ke service class
style: format blade template
```

### Pull Request Checklist

Before creating PR:

- [ ]  Code tested manually (both success + error cases)
- [ ]  No console.log / debug code / dd() / dump()
- [ ]  Pulled latest main before creating PR
- [ ]  All tests pass (`php artisan test --compact`)
- [ ]  Pint formatting applied (`vendor/bin/pint --format agent`)

### PR Description Template

```
## Deskripsi
[jelaskan perubahan]

## Issue terkait
Closes #<number>

## Perubahan
- [x] Perubahan 1
- [x] Perubahan 2

## Checklist
- [ ] Kode sudah di-test manual
- [ ] Tidak ada debug code
- [ ] Udah pull latest main
```

### Review Etiquette

- Reviewer checks "Files changed" tab thoroughly
- Approve OR Request Changes with specific feedback
- Creator merges after approval (Squash and Merge)
- Delete branch after merge

## Code Quality

| Tool | Purpose | When |
| --- | --- | --- |
| Laravel Pint | PHP code style | Before every commit |
| Pest | PHP tests | Before every PR |
| ESLint | JS/TS linting | Before every commit |
| Prettier | JS/TS formatting | Before every commit |
| TypeScript strict | Type safety | Always on in tsconfig |

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DB_DATABASE` | Yes | MySQL database name |
| `DB_USERNAME` | Yes | MySQL user |
| `DB_PASSWORD` | Yes | MySQL password |
| `APP_KEY` | Yes | Laravel encryption key |
| `WHATSAPP_NUMBER` | Yes | Target number for checkout deep-link |
| `VITE_API_BASE_URL` | Yes | Backend API URL for frontend |
| `APP_ENV` | Yes | local/production |
| `APP_DEBUG` | Dev | Enable for local debugging |

## Setup Commands

### Backend

```bash
cd Back-End
composer install
cp .env.example .env
# Edit .env with DB credentials
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend

```bash
cd Front-End
npm install
cp .env.example .env
# Set VITE_API_BASE_URL
npm run dev
```