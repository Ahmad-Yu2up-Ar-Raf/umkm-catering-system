<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Backend Agent Rules · **Monorepo Root:** `../`
>
> [Global Context](../docs/project-context.md) · [Monorepo Architecture](../docs/architecture.md) · [API Specs](./docs/api-collection.md) · [Frontend Consumer](../frontend/README.md) · [Frontend Architecture](../frontend/docs/architecture.md)

# Catering Nusantara Back-End — Agent Context (OpenCode)

> Level-100 quick-start for AI agents working inside `backend/`. Read the modular docs (below) for deep context. This file is the fast-loading overview.

> **Consumer awareness:** every endpoint here is consumed by the React/Vite SPA at `../frontend`. The API contract lives in **`docs/api-collection.md`** — keep it and the generated `openapi.json` in sync whenever routes, Form Requests, or Resources change.

## Project Identity

**Catering Nusantara** — hybrid F&B platform (Bogor, since 2024, PIC: Eva Rudianti).
One database, **two surfaces**:
- **Public Site** — read-only catalog (`paket`, `galeri`), anonymous, converts visitors to **WhatsApp** deep-link checkout.
- **Admin CMS + Mini POS** — Sanctum-authenticated; the ONLY surface writing to `pesanan`. Auto-calculates totals, generates `nomor_struk`, keeps order history.

**Golden rule:** WhatsApp stays the sales channel; the system eliminates manual arithmetic/record-keeping around it.

## Tech Stack

Laravel 13 / PHP 8.4 · Sanctum 4 (SPA tokens) · Breeze 2 · Pest 4 · Neon Database (serverless PostgreSQL) · Pint 1 · Scramble `^0.13` (OpenAPI/Scalar docs).

## Quick-Start Rules (non-negotiable)

1. **`total_harga` is SERVER-COMPUTED ONLY.** Never accept from request body. Formula: `(jumlah_paket × harga_paket_satuan) + biaya_tambahan`.
2. **`harga_paket_satuan` is a SNAPSHOT** copied at order creation — never re-query `paket.harga_per_porsi` on read.
3. **`nomor_struk` = server-generated** `STR-YYYYMMDD-XXXX` (daily sequential counter).
4. **Tumpeng Mini:** `harga_per_porsi = 25000`, `min_order = 10` (per-package pricing). NEVER store Rp250.000 raw.
5. **JSON arrays** (`menu_utama`, `menu_tambahan`, `fasilitas_termasuk`, `detail_tambahan`) → model `array` casts + FormRequest shape validation only. No junction tables.
6. **4 core tables only** (`users`, `paket`, `galeri`, `pesanan`). No new tables without approval (`testimoni`/`faq` NOT approved).
7. **Zero-Hallucination pipeline** with every feature (see docs/workflow.md): code → Pest GREEN → Bruno → Scramble.
8. Run `vendor/bin/pint --dirty --format agent` on changed PHP files before finalizing.

## Hard Stops

- ❌ No `total_harga` / `nomor_struk` from client.
- ❌ No unvalidated JSON array writes.
- ❌ No tables beyond the 4 core.
- ❌ No skipping tests / Pint.
- ❌ No deleting tests without approval.

## 📚 Documentation Map (read before coding)

| File | Purpose |
|------|---------|
| `docs/workflow.md` | Zero-Hallucination pipeline: Code → Pest → Bruno → Postman → Scramble + pre-flight checklist |
| `docs/architecture.md` | Folder structure, flat controllers (LOCKED), Enums/Requests/Resources/Services layers, routes, response envelope, code conventions |
| `docs/database.md` | Full DBML schema, JSON array rules, critical business rules (pricing, struk, Tumpeng Mini) |
| `docs/boost-guidelines.md` | Laravel Boost MCP tooling guidelines (auto-generated block, relocated here) |

## Cross-Reference (repo root)

- `../docs/architecture.md` — sitemap & monorepo-wide ERD
- `../frontend/docs/design.md` — design tokens (frontend)
- `../docs/git-workflow.md` — branch/PR/commit conventions

===

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.4
- laravel/framework (LARAVEL) - v13
- laravel/prompts (PROMPTS) - v0
- laravel/reverb (REVERB) - v1
- laravel/sanctum (SANCTUM) - v4
- laravel/boost (BOOST) - v2
- laravel/breeze (BREEZE) - v2
- laravel/mcp (MCP) - v0
- laravel/pail (PAIL) - v1
- laravel/pint (PINT) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Always use `search-docs` before making code changes. Do not skip this step. It returns version-specific docs based on installed packages automatically.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

## Pest

- This project uses Pest for testing. Create tests: `php artisan make:test --pest {name}`.
- The `{name}` argument should not include the test suite directory. Use `php artisan make:test --pest SomeFeatureTest` instead of `php artisan make:test --pest Feature/SomeFeatureTest`.
- Run tests: `php artisan test --compact` or filter: `php artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.

</laravel-boost-guidelines>
