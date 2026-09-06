# Real-Time Pesanan System — PRD (Reverb + TanStack Query + uisfx)

> **Status:** Planning / Research — **NO CODE** in this phase (explicit green-light required before build).  
> **Date:** 2026-05-13  
> **Author:** Architecture Audit (Catering Nusantara)  
> **Stack:** Laravel 13 + Sanctum · Vite + React 19 + TanStack Query 5 · `uisfx@0.4.0` · Laravel Reverb (evaluated PartyKit)  
> **Path:** `frontend/docs/realtime-pesanan-prd.md` (canonical)

---

## 1. Executive Summary & System Objectives

### Scope
Transform the current **request/response + manual refresh** pesanan flow into an **event-driven, push-based** admin experience. Today a public visitor submits `POST /api/v1/pesanan` via `order-form.tsx` (fire-and-forget, WA instant) and an admin on `/dashboard{,/paket,/galeri,/pesanan}` sees nothing until they reload or navigate. This PRD designs the missing **global real-time layer** so every admin tab, on every sub-route wrapped by `AppShell`, learns about a new order within ~100ms, renders a Sonner banner, plays one restrained audio cue, and silently invalidates the TanStack Query cache for `MasterPesananPage` — with **zero polling**.

### Objectives (measurable)
- **O1 — Stale-data elimination:** New `pesanan` visible in `MasterPesananPage` without manual refresh, p95 < 300ms from `PesananController::store` commit.
- **O2 — Global feedback:** Admin receives a Sonner toast + `uisfx` cue on **any** `/dashboard/*` route (not only `/dashboard/pesanan`).
- **O3 — Zero polling:** No `refetchInterval` / `setInterval` / `staleTime` tricks; invalidation only on WebSocket push.
- **O4 — Non-blocking public UX preserved:** `order-form.tsx` stays fire-and-forget (WA instant). Real-time is additive, never regresses public conversion.
- **O5 — Operational hygiene:** Reconnection, StrictMode, mute preference, and horizontal-scale path documented before code.

### Out of scope (Phase 1)
- Customer-facing order-status push (Phase 2).
- Collaborative editing / presence (PartyKit sweet spot — deferred).
- Native mobile audio (MP3/Ogg fallback documented, not built now).

### Success criteria
- Admin A (on `/dashboard`) and Admin B (on `/dashboard/pesanan` page 2) both get the same notification within the same second.
- `MasterPesananPage` pagination re-fetches exactly once per event (no duplicate invalidations).
- No audio plays before `ui.unlock()` user gesture; no duplicate cue on StrictMode double-mount.
- `pnpm build` + `tsc --noEmit` green; no new polling timers in React Query DevTools.

---

## 2. Deep Codebase Audit — Findings

### 2.1 Methodology
Read actual files on disk (no guessing). See §6 matrix P-0.

### 2.2 Frontend — `frontend/`

| File | Finding | Implication |
|------|---------|-------------|
| `src/components/ui/core/layout/dashboard/app-shell.tsx:1-22` | Pure layout: `SidebarProvider` + `AppSidebar` + `SidebarInset` + `<Outlet/>`. **No** `useEffect`, no `useQuery`, no `Echo`, no `createUISFX`, no `Toaster` subscription. | Missing **global event-listener lifecycle**. This is the correct mount point for a single WebSocket subscription that survives sub-route changes, but it currently subscribes to nothing. |
| `src/components/ui/core/block/detail/components/order-form.tsx:1-282` | Fire-and-forget `void pesananService.createPublic(payload).catch(console.error)` then `window.open(waUrl)` + `toast.success` + `onSuccess()` (reset/close). Schema now enforces `minOrder` + `capacity`. No broadcast logic — correct (producer, not consumer). | Producer is done. No change needed here except documenting that `POST /pesanan` is the **domain event source**. |
| `src/components/ui/core/block/admin/pesanan/master-pesanan-block.tsx:43-331` | `usePesananList({statuses,search,sortBy,sortDir,page,perPage})` with `keepPreviousData`, `staleTime:5s`. Query key `["admin","pesanan", …]`. No `refetchInterval`, no `subscribe`. Mutations (`usePesananDeleteMutation`) invalidate via `queryClient.invalidateQueries(["admin","pesanan"])`. | Consumer is **polling-free but push-blind**. Cache only refreshes on local mutation or 5s staleness + refocus (disabled globally). Needs **external invalidation** on broadcast. |
| `src/components/ui/core/block/admin/pesanan/hooks/use-pesanan-query.ts:28-30` | `queryKey: ["admin","pesanan", statuses, …]` + `placeholderData: keepPreviousData` + `staleTime: 5000`. | Stable key is ideal for targeted invalidation (`invalidateQueries({queryKey: ["admin","pesanan"]})`). No `refetchInterval` — good (no polling hazard yet). |
| `src/components/ui/core/block/admin/pesanan/hooks/use-pesanan-mutations.ts:1-143` | `ADMIN_PESANAN_KEY = ["admin","pesanan"]`, `STRUK_KEY = ["struk"]`. `onSuccess` invalidates `ADMIN_PESANAN_KEY`. Includes `usePublicPesananCreateMutation` (now unused by public flow, kept for parity). | Mutation layer already centralizes invalidation — broadcast handler should reuse the same key. |
| `src/components/ui/fragments/shadcn-ui/sonner.tsx:1-69` | `Toaster` is theme-aware (`next-themes`), custom HugeIcons per variant, `position="top-center"` set in `app.tsx:22`. Installed globally once in `App` (correct singleton). | Sonner is ready for programmatic `toast.success/info` from `AppShell` listener — no new provider needed. |
| `src/app.tsx:8-16` | `QueryClient` with `staleTime:5min`, `refetchOnWindowFocus:false`, `retry:1`. Single `Toaster` + `QueryClientProvider` + `RouterProvider`. | Global config suppresses spurious refetches — push model fits. `queryClient` must be reachable from `AppShell` (it is, via `useQueryClient`). |
| `src/router/index.tsx:64-90` | `/dashboard` → `AppShell` with children `index, paket, galeri, pesanan`. Guarded by `AuthenticatedGuard`. | All admin sub-routes share `AppShell` mount — one subscription covers Anomaly 2. |
| `docs/uisfx-guide.md` + `package.json:52` | `uisfx@0.4.0` already installed, guide pins `minimal` pack, contract: one `createUISFX` singleton, `await ui.unlock()` from user gesture, never SSR, one cue per interaction, loops (`loading`/`processing` etc.) require `stop()` + `finally`, `preferences: {key}` for mute persistence, StrictMode double-mount guard, no hover on touch. | No install needed; implement `src/lib/uisfx.ts` singleton + `useUISFX` hook per guide. Pack selection justified in §3.3. |
| `vite.config.ts` | `react()` + `tailwindcss()` only. No WebSocket plugin. | Reverb/Echo is client-only — init must be gated `typeof window !== "undefined"`. |

### 2.3 Backend — `backend/`

| Path | Finding | Implication |
|------|---------|-------------|
| `config/broadcasting.php` | **Missing** (no file). `config/` contains `auth, cache, queue, filesystems…` but no `broadcasting.php`. | Broadcasting never configured. `BROADCAST_CONNECTION` not in `.env.example` (only `BROADCAST_CONNECTION=log` in example line 37). Currently log driver — no WS. |
| `.env.example:37` | `BROADCAST_CONNECTION=log`, `QUEUE_CONNECTION=database`. No `REVERB_*` keys, no `PUSHER_*` keys, no `VITE_REVERB_*`. | Phase 1 must add `reverb` driver + `REVERB_APP_ID/KEY/SECRET/HOST/PORT/SCHEME` + `VITE_REVERB_*` for Echo. Log driver is correct fallback until Reverb installed. |
| `composer.json:11-16` | `laravel/framework ^13.8`, `laravel/sanctum ^4.0`, no `laravel/reverb`, no `pusher/pusher-php-server`. | Must `composer require laravel/reverb` (or `php artisan reverb:install`). No Pusher vendor — justifies Reverb over Pusher SaaS. |
| `app/Events/` | **No directory** (glob found nothing). No `OrderCreated` event, no listeners. | Domain event missing — must create `app/Events/PesananCreated.php` (`ShouldBroadcast`). |
| `app/Http/Controllers/PesananController.php:91-102` | `store(PesananStoreRequest $request)` does `Paket::findOrFail` + `$service->createOrder(validated, paket)` then returns `201 {data: PesananResource}`. No `broadcast()`, no `event()`, no `dispatch`. | Current lifecycle ends at HTTP response. Must add `PesananCreated::dispatch($pesanan)` after commit (or `broadcast(new PesananCreated)` inside `PesananService` transaction). |
| `routes/api.php:22-52` | `POST /api/v1/pesanan` public (`pesanan.public-store`) + `POST /api/v1/admin/pesanan` auth. Both hit same `store`. No broadcast route, no `/broadcasting/auth`. | Broadcasting auth route (`/api/broadcasting/auth`) must be enabled for private channels; public order creation should broadcast on **private admin channel** (`private-admin.pesanan`) not public, to avoid guest subscription. |
| `app/Services/PesananService.php:22-50` | `createOrder` validates `memenuhiMinOrder` / `dalamKapasitas`, snapshots `harga_paket_satuan`, computes `total_harga`, generates `nomor_struk`, saves. No event. | Ideal dispatch point — after `$pesanan->save()` and before return, so transaction is durable. |

### 2.4 Why TanStack Query alone cannot push

TanStack Query is a **pull cache** with smart staleness heuristics (`staleTime`, `refetchOnWindowFocus`, `refetchInterval`). It has no server-initiated invalidation primitive. Without a broker:

- New `pesanan` rows are invisible until the cache is marked stale **and** a component re-renders or window refocuses.
- Setting `refetchInterval: 2000` would simulate push but creates O(adminTabs × pollingRate) DB load (Neon serverless + `php artisan serve` single-thread → serialized 5s queries → tail latency collapse, see `pesanan-service.ts:30` comment).
- Mutations only invalidate the **local** `QueryClient` that performed them — a public visitor's `createPublic` cannot invalidate an admin's `QueryClient` in another browser.

Push requires a **broker** (WebSocket) that fans out a single DB commit to N admin `QueryClient`s via `invalidateQueries`.

---

## 3. Technology Research & Selection

### 3.1 `uisfx` — UI Sound Effects

**Pack selection: `minimal` (primary), `soft` as optional user-toggle alternate.**

| Pack | Character (per catalog) | Audit vs. Catering Nusantara admin |
|------|-------------------------|-------------------------------------|
| `minimal` | *Dry, precise, almost invisible. Productivity, SaaS, system UI.* | ✅ **Chosen.** Admin MDM is data-dense (tables, filters, pagination). `minimal` has lowest audio density, no musical tail, passes guide rule "good integration feels coherent, restrained." Matches `shadcn` design tokens, not gamified. |
| `soft` | Rounded felt, warm reassuring. Mobile, wellness, friendly SaaS. | Warm brand fit ("home cooking") but higher presence → risk fatigue on repeated orders. Keep as `preferences` toggle alternate, not default. |
| `studio`/`glass`/`zen` | Premium/crystalline/calm. | Over-scored for a CRUD dashboard; `cinematic`/`arcade`/`rubber` clash with trustworthy POS tone. |

**Key contract (from `docs/uisfx-guide.md` deep read):**
- Singleton `createUISFX({pack:'minimal', volume:0.7, preferences:{key:'catering:sound'}})` — never in SSR, never duplicate on StrictMode.
- `await ui.unlock()` from first trusted pointer/keyboard handler **before** any async `play`. Until unlocked, suppress background cues (don't queue stale).
- One cue per transaction: `notification` or `receive` for new order (catalog: `notification: New information is available, without urgency`). Alternatives `receive` (response arrives) or `success` (action finished) — `notification` is most accurate for passive admin observation.
- Loops: if we show a connecting indicator, use `connecting` loop with handle + `stop()` on `finally`, `unmount`, `mute`, `setEnabled(false)` → `stopAll()`.
- React 19 peer: guide warns `react-reconciler` override — check `package.json` already `react@19.2.6`, so install needs `npm install uisfx --force` or `overrides: { "react-reconciler": "^0.32" }` if peer fails (verify in Phase P-1).
- Packs are swappable without logic change (`ui.setPack('soft')` migrates active loops).

### 3.2 Laravel Reverb — Backend WebSocket

**Selection: Laravel Reverb (over Pusher SaaS and polling).**

| Option | Latency | Cost | Auth | Scale | Verdict |
|--------|---------|------|------|-------|---------|
| HTTP polling (`refetchInterval: 2s`) | 1–2s avg, tail 5s+ (Neon PgBouncer) | DB CPU linear with admins | n/a | Poor — N × QPS | ❌ Rejected — Anomaly 3 |
| Pusher (SaaS) | ~50ms | $/connection + message quota, vendor lock | Echo + Pusher protocol | Managed, pricey at scale | Viable but unnecessary cost; same protocol Reverb already implements |
| **Laravel Reverb** | ~30–80ms (single server thousands conns) | **Free**, self-hosted on Forge/Cloud, Redis for horizontal scale | Sanctum + `Broadcast::auth` private channels, `Pulse` monitoring | Redis pub/sub across servers, Pusher protocol compatible | ✅ **Chosen** — native Laravel 11/13, zero vendor, Forge one-click, Echo compatible |

**Docs synthesis (reverb.laravel.com + `laravel/docs/broadcasting`):**
- `php artisan reverb:install` scaffolds `config/reverb.php`, env keys, and `routes/channels.php`.
- `BROADCAST_CONNECTION=reverb`, `REVERB_APP_ID/KEY/SECRET/HOST/PORT/SCHEME`, plus `VITE_REVERB_APP_KEY/HOST/PORT/SCHEME` for Echo.
- Event `PesananCreated implements ShouldBroadcast` broadcasts on `ShouldBroadcast` channel; private channel `private-admin.pesanan` requires `Broadcast::channel('admin.pesanan', fn(User $user) => $user->can('view-pesanan'))` or simple `auth:sanctum` guard since all `/dashboard/*` users are authenticated. Public creator never subscribes.
- Frontend `laravel-echo` + `pusher-js` (Reverb speaks Pusher protocol) — `new Echo({broadcaster:'reverb', key, wsHost, wsPort, forceTLS, auth:{headers:{Authorization:`Bearer ${token}`}}})`.
- Horizontal: `REVERB_SCALING=redis` + `php artisan reverb:start --host --port` behind Supervisor.

### 3.3 PartyKit — Edge Real-Time (evaluation)

**Evaluation: Defer PartyKit; Reverb suffices for Phase 1. PartyKit becomes Phase 2 if needed.**

- **What it is:** Edge-deployed JS PartyServer (Cloudflare Workers) for multiplayer sync, presence, cursors, collaborative editors — `PartySocket` client, `Y-PartyKit` for Yjs, `partykit.json` config, hibernation scaling.
- **Fit for this PRD:** Pesanan flow is **single-writer (public visitor) → N-reader (admins)** broadcast, not multi-writer conflict/presence/cursors. Reverb already fans out to all admin tabs with private-channel auth via Sanctum. PartyKit would add a second broker, second auth layer, second deploy target, and duplicate the `pesanan` domain outside Laravel.
- **When to adopt:** If later we add live collaboration (e.g., two admins editing same `paket` / `galeri` with Yjs, live cursors on `pesanan` table, or AI agent long-lived sessions), PartyKit's edge presence + Yjs is superior to Reverb. Keep as **optional Phase 2** behind feature flag `VITE_PARTYKIT_HOST` — AppShell can bridge Reverb event → PartyKit party for presence without replacing Reverb as source of truth.
- **Risk if we chose PartyKit now:** Auth mismatch (Sanctum JWT vs PartyKit token), persistence gap (PartyKit storage vs Neon `pesanan` table), operational overhead (two WebSocket fleets).

**Decision matrix:**

| Criterion | Reverb | PartyKit | Polling |
|-----------|--------|----------|---------|
| Single source of truth (Neon `pesanan` table) | ✅ Laravel owns | ❌ Edge cache diverges | ⚠️ DB load |
| Private admin auth (Sanctum) | ✅ Built-in | Needs custom token | n/a |
| Ops cost (self-host vs SaaS/edge) | Free + Forge | Free tier then per connection | DB CPU |
| Use case match (broadcast new row) | Perfect | Overkill | Inefficient |
| Future collab | Limited | Ideal | No |

→ **Phase 1: Reverb only. Phase 2: Reverb (source) → PartyKit (presence) bridge if product needs multiplayer.**

---

## 4. Architecture & Data Flow

### 4.1 ASCII Lifecycle (public submit → admin notification)

```
 ┌─────────────┐      1 POST /api/v1/pesanan       ┌──────────────┐
 │  order-     │  ─────────────────────────────► │  Laravel     │
 │  form.tsx   │   fire-and-forget                │  Pesanan     │  2 validate
 │  (public)   │   pesananService.createPublic    │  Controller  │  PesananStoreRequest
 │             │                                  │  ::store     │  + HargaService
 └──────┬──────┘                                  └──────┬───────┘
        │ 3 generate WA URL (sync)                      │ 3 createOrder()
        │   getWhatsAppLink(BUSINESS_NUMBER, msg)        │   snapshot harga
        │                                                │   total_harga
        │ 4 void createPublic().catch(console.error)     │   nomor_struk
        │   (no await)                                   │   save()
        │                                                │
        │ 5 window.open(waUrl, "_blank")                │ 4 dispatch
        │   toast.success + onSuccess() (instant)        │   PesananCreated
        │                                                │   ShouldBroadcast
        ▼                                                ▼
  WhatsApp Tab                                    ┌──────────────┐
  (user leaves)                                   │  Reverb WS   │
                                                  │  private-    │
                                                  │  admin.      │
                                                  │  pesanan     │  5 fan-out
                                                  └──────┬───────┘
                                                         │ Pusher protocol
                                      ┌──────────────────┼──────────────────┐
                                      │                  │                  │
                               ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐
                               │ AppShell    │    │ AppShell    │    │ AppShell    │
                               │ Tab A       │    │ Tab B       │    │ Tab C       │
                               │ /dashboard  │    │ /dashboard/ │    │ /dashboard/ │
                               │             │    │ pesanan p2  │    │ paket       │
                               └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
                                      │ 6 Echo.private   │                  │
                                      │  ('admin.pesanan') listen            │
                                      │  ('PesananCreated')                  │
                                      ▼                  ▼                  ▼
                               ┌─────────────────────────────────────────────────┐
                               │  Global handler in AppShell (singleton)       │
                               │  7a queryClient.invalidateQueries             │
                               │      (["admin","pesanan"]) → MasterPesanan     │
                               │      re-fetches once, keepPreviousData        │
                               │  7b toast.info("Pesanan baru: Budi — Paket X")│
                               │      via Sonner (top-center)                  │
                               │  7c uisfx.play('notification')                │
                               │      (or 'receive', single cue, cooldown)     │
                               └─────────────────────────────────────────────────┘
```

### 4.2 Why `AppShell` is the only correct global listener

- `AppShell` is the **least common ancestor** of all `AuthenticatedGuard` children (`/dashboard`, `/dashboard/paket`, `/galeri`, `/pesanan`). A listener in `MasterPesananPage` would miss events when admin is on `/dashboard` or `/dashboard/paket`.
- `AppShell` mounts once per authenticated session (outside `Outlet`), so one `Echo` subscription covers route transitions without re-subscribing. `MasterPesananPage` may unmount on nav, but `AppShell` stays.
- Sonner `Toaster` is global (`app.tsx:22`), so `toast.*` from `AppShell` is visible regardless of current `Outlet`.
- `uisfx` singleton likewise lives at app scope — one `AudioContext` per session, unlocked once from a trusted gesture (first admin click/keypress after login).

### 4.3 Event-driven invalidation (no polling)

```
Admin usePesananList staleTime:5s  ──►  normally stale after 5s
But we do NOT rely on that.

Reverb push → AppShell handler → queryClient.invalidateQueries({queryKey: ["admin","pesanan"]})
         → all active usePesananList instances (any page/perPage/sort) that match prefix refetch once
         → MasterPesananPage re-renders with keepPreviousData → new row at top (created_at desc)
         → other dashboards get toast + sound but do NOT refetch unless they navigate to pesanan
```

Polling alternative (rejected): `refetchInterval: 2000` would be `adminTabs × 30 req/min × JOIN pesanan+paket + pagination` against Neon — quickly exhausts `php artisan serve` single thread (see `pesanan-service.ts:30` comment) and PgBouncer prepared-plan cache (`DEALLOCATE ALL` hack in `PesananController::index`). Push is O(1) per order.

---

## 5. Implementation Roadmap & Pseudo-Code

> **Guard:** Do not start P-3 until user green-light. Phases are ordered, each gates the next.

### Phase P-1.5 — Backend Reverb scaffold (Laravel)

```bash
composer require laravel/reverb
php artisan reverb:install
# choose: reverb + queue, Horizon optional
php artisan reverb:start --host=127.0.0.1 --port=8080
```

`.env` additions (and `.env.example` mirror):
```
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=local-123
REVERB_APP_KEY=local-key
REVERB_APP_SECRET=local-secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

`routes/channels.php`:
```php
Broadcast::channel('admin.pesanan', function (User $user) {
    return $user !== null; // all authed dashboard users; tighten to role check if needed
});
```

`app/Events/PesananCreated.php`:
```php
class PesananCreated implements ShouldBroadcast
{
    public function __construct(public Pesanan $pesanan) {}
    public function broadcastOn(): PrivateChannel { return new PrivateChannel('admin.pesanan'); }
    public function broadcastWith(): array { return (new PesananResource($this->pesanan->load('paket')))->toArray(request()); }
    public function broadcastAs(): string { return 'pesanan.created'; }
}
```

`PesananController::store` (after `$pesanan = $this->service->createOrder(...)`):
```php
broadcast(new PesananCreated($pesanan))->toOthers();
// or PesananCreated::dispatch($pesanan) if ShouldBroadcastNow
```

Queue: `QUEUE_CONNECTION=database` already, run `php artisan queue:listen` in dev `composer dev` concurrently.

### Phase P-2 — Frontend Echo + uisfx singletons

**2a. Install Echo (if not present):**
```bash
pnpm add laravel-echo pusher-js
```

**2b. `src/lib/echo.ts` (client-only singleton, no SSR):**
```ts
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
declare global { interface Window { Pusher: typeof Pusher } }
if (typeof window !== 'undefined') window.Pusher = Pusher

let _echo: Echo<'reverb'> | null = null
export function getEcho(): Echo<'reverb'> | null {
  if (typeof window === 'undefined') return null
  if (_echo) return _echo
  _echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT),
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws','wss'],
    auth: { headers: { Authorization: `Bearer ${useAuthStore.getState().token}` } },
    // authEndpoint: `${VITE_API_URL}/broadcasting/auth` (default)
  })
  return _echo
}
export function destroyEcho() { _echo?.disconnect(); _echo = null }
```

**2c. `src/lib/uisfx.ts` (per `docs/uisfx-guide.md` contract):**
```ts
import { createUISFX, type UISFXPlayer } from 'uisfx'
let _ui: UISFXPlayer | null = null
let _unlockPromise: Promise<void> | null = null
export function getUISFX(): UISFXPlayer {
  if (_ui) return _ui
  _ui = createUISFX({
    pack: 'minimal',
    volume: 0.7,
    preferences: { key: 'catering:sound' }, // persists enabled/pack/volume
  })
  // Do not unlock here (no gesture). Caller must call unlockUISFX() from click/key
  return _ui
}
export async function unlockUISFX() {
  if (_unlockPromise) return _unlockPromise
  _unlockPromise = getUISFX().unlock().catch(()=>{})
  return _unlockPromise
}
export async function destroyUISFX() { if(_ui){ await _ui.destroy(); _ui=null; _unlockPromise=null } }
```

**2d. `src/components/ui/core/layout/dashboard/use-realtime-pesanan.ts` (global hook):**
```ts
export function useRealtimePesanan() {
  const queryClient = useQueryClient()
  const lastSeenRef = useRef<string | null>(null) // dedup by pesanan.id + nomor_struk
  useEffect(() => {
    const echo = getEcho(); if(!echo) return
    const channel = echo.private('admin.pesanan')
    const handler = (e: { id:number; nomor_struk:string; nama_pemesan:string; paket?:{nama_paket:string} }) => {
      const key = String(e.id)
      if (lastSeenRef.current === key) return
      lastSeenRef.current = key
      // Cooldown is built into uisfx; add our own dedup for Echo reconnect bursts
      queryClient.invalidateQueries({ queryKey: ["admin","pesanan"] })
      toast.info(`Pesanan baru — ${e.nama_pemesan} (${e.paket?.nama_paket ?? 'paket'})`, {
        description: `Struk ${e.nomor_struk} — buka Daftar Pesanan`,
        action: { label: "Lihat", onClick: () => navigate('/dashboard/pesanan') },
      })
      // Suppress until unlocked; do not queue stale
      const ui = getUISFX()
      if (ui.isEnabled()) { void ui.play('notification') } // one cue, not stacked
    }
    channel.listen('.pesanan.created', handler)
    return () => { channel.stopListening('.pesanan.created'); echo.leave('admin.pesanan') }
  }, [queryClient])
}
```

**2e. `AppShell.tsx` integration (global mount, StrictMode-safe):**
```tsx
export function AppShell() {
  useRealtimePesanan()
  // Unlock on first trusted gesture (guide: before async playback)
  useEffect(() => {
    const unlock = () => { void unlockUISFX(); window.removeEventListener('click', unlock); window.removeEventListener('keydown', unlock) }
    window.addEventListener('click', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => { window.removeEventListener('click', unlock); window.removeEventListener('keydown', unlock) }
  }, [])
  useEffect(() => () => { /* do not destroy on unmount — AppShell lives whole session; destroy only on logout */ }, [])
  return (/* existing SidebarProvider ... Outlet ... */)
}
```

**2f. Sound preference UI (reuse existing settings or add `src/components/ui/core/layout/dashboard/sound-toggle.tsx`):**
- Switch + volume slider bound to `ui.isEnabled()` / `ui.setEnabled()` / `ui.setVolume()` / `ui.setPack()`; persist via `preferences.key` localStorage. On `setEnabled(false)` → `ui.stopAll()` immediately (guide rule).

### Phase P-3 — Verification (no code, just checklist)

- `pnpm typecheck` + `pnpm build` green.
- Manual: open two admin browsers (different users), submit public order, assert both get toast + sound < 1s and `MasterPesanan` row appears without refresh.
- DevTools: no `setInterval` timers, no `refetchInterval` in Query DevTools, one WS connection per tab (`ws://127.0.0.1:8080`).
- Audio: first click unlocks, mute toggle persists after reload, no double cue on StrictMode reload.

---

## 6. Risk Mitigation & Edge-Case Engineering

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Reconnection storm** (N tabs × disconnect) | Thundering herd on Reverb + Neon `pesanan` SELECT | Echo exponential backoff (default) + `lastSeenRef` dedup; `invalidateQueries` is idempotent — many tabs invalidate but only visible `MasterPesanan` refetches. Add `REVERB_SCALING=redis` + `php artisan reverb:start` behind Supervisor for horizontal. |
| **Duplicate notifications** (StrictMode double-mount, Echo reconnect, broadcast `toOthers` vs `to all`) | Admin hears two `notification` cues for one order | Singleton `getEcho`/`getUISFX`, `useEffect` cleanup `stopListening` + `leave`, `lastSeenRef` by `pesanan.id`, `broadcast(...)->toOthers()` so submitter (public guest has no Echo, irrelevant) not double. `uisfx` built-in cooldown also suppresses rapid repeats. |
| **Memory leak on unmount** (loops left running) | Invisible `connecting` loop never stops | No loops in Phase 1 (only one-shot `notification`). If `connecting` added for "reconnecting..." indicator, keep handle `let conn = ui.play('connecting')` and `conn?.stop(); conn=null` in `finally`, `on mute`, `useEffect cleanup`, and `destroyEcho`. |
| **SSR / StrictMode audio init failure** | `AudioContext` created during SSR or double-created | Gate all `createUISFX`/`Echo` behind `typeof window !== 'undefined'`; `getUISFX` singleton prevents double instantiation; never call `ui.play` during render, only in event handler. |
| **Popup/WS blocked before unlock** | Sound never plays, WS auth 403 | Unlock from first trusted gesture (`click`/`keydown` in `AppShell`); until then suppress `ui.play` (don't queue). For WS, pass `Authorization: Bearer <sanctum token>` via `auth.headers`; test `POST /api/broadcasting/auth` returns 200 for authed user, 403 for guest (which never subscribes). |
| **Auth token expiry mid-session** | Private channel kicked, no further pushes | Echo `auth` uses current `useAuthStore.getState().token`; on 401 `app.tsx:22` already does `setLogout` + redirect to `/login`. Add `destroyEcho` on logout. |
| **Volume / mute UX** | Admin annoyed by sound | Persisted `preferences: {key:'catering:sound'}` + visible toggle (HeaderDashboard or AppSidebar footer). `setEnabled(false)` → `stopAll()` immediate. Respect `prefers-reduced-motion` for motion, not for audio (per guide). |
| **React 19 `react-reconciler` peer** | `npm install uisfx` peer conflict | Pin `overrides: { "react-reconciler": "^0.32.0" }` in `package.json` or `pnpm --force`. Verify in P-1 `pnpm install` dry-run before build. |
| **Queue not running** (broadcast queued) | Event never reaches Reverb | `composer.json:53` dev script already runs `php artisan queue:listen` concurrently. For prod, use Supervisor + `queue:work --tries=1` with Horizon. Use `ShouldBroadcastNow` vs `ShouldBroadcast` choice: Phase 1 uses `ShouldBroadcast` (queued) for durability; if queue stalls, switch to `ShouldBroadcastNow` (sync) for immediacy with `try/catch` fallback. |
| **Neon + PgBouncer prepared-plan cache** | `PesananController::index` `whereIn` + `paginate` may hit stale plan after DDL | Already mitigated by `DEALLOCATE ALL` + `DISCARD ALL` in `index`. No change needed, keep after migrating to push. |

---

## 7. Technology Selection Justification — Summary

- **Reverb vs polling:** Polling is O(adminTabs × pollRate) DB load, incompatible with Neon serverless single-thread dev server; Reverb is O(1) per order, Pusher-protocol compatible, free, horizontally scalable via Redis.
- **Reverb vs Pusher SaaS:** Same protocol (`pusher-js` + `laravel-echo`), Reverb eliminates SaaS cost/quota, keeps private-channel auth inside Laravel/Sanctum, deploys on Forge/Cloud with Pulse monitoring. Pusher only justified if we need global edge POPs before we have them — not needed for catering admin (Jakarta region).
- **PartyKit vs Reverb:** PartyKit shines for multiplayer presence/cursors/Yjs — not for single-writer broadcast where Laravel is source of truth. Adding PartyKit now duplicates auth and persistence with no gain. Recommend **Reverb Phase 1, PartyKit optional Phase 2 bridge** for collaborative paket editing.
- **`uisfx` pack `minimal`:** Lowest audio density, matches `shadcn` MDM density, avoids gamified fatigue, swappable to `soft` without code change via `setPack`. One cue `notification` per order, not stacked `success`+`receive`. Unlock gated to user gesture, singleton, StrictMode-safe, preference-persisted.

---

## 8. Out-of-Scope & Future Enhancements

- Per-order deep-link from toast action (`/dashboard/pesanan?highlight=<id>` + row flash).
- Sound pack selector in Admin Settings (persisted `minimal` ↔ `soft` ↔ `zen`).
- PartyKit presence: "2 admins viewing pesanan" avatars + Yjs live edit for `paket`.
- Customer-facing status push (public private channel `private-pesanan.{id}`).
- Analytics: `ui.play` count vs. order count correlation for ops dashboard.

---

## 9. Appendix — Query Keys & Channel Contract

- **Query key:** `["admin","pesanan", statuses, metodePembayaran, search, sortBy, sortDir, page, perPage]` (`use-pesanan-query.ts:29`). Invalidation uses prefix `["admin","pesanan"]` to cover all pages.
- **Channel:** `private-admin.pesanan`, event `.pesanan.created`, payload `PesananResource` (already used by `store` 201). Auth via `Broadcast::channel('admin.pesanan', fn(User $u)=> $u !== null)`.
- **Sound contract:** `pack: 'minimal'`, `cue: 'notification'` (one-shot), `volume:0.7`, `cooldownMs` default, `preferences.key:'catering:sound'`.

---

## 10. References

- `frontend/docs/uisfx-guide.md` (local, 2026-07-13, `minimal` pack)
- https://uisfx.com, https://github.com/romainsimon/uisfx, https://www.npmjs.com/package/uisfx, https://uisfx.com/uisfx-catalog.json
- https://reverb.laravel.com, https://laravel.com/docs/broadcasting, https://github.com/laravel/reverb
- https://www.partykit.io, https://docs.partykit.io, https://github.com/partykit/partykit
- Local audit: `AppShell`, `order-form.tsx`, `master-pesanan-block.tsx`, `use-pesanan-query.ts`, `use-pesanan-mutations.ts`, `PesananController.php`, `PesananService.php`, `routes/api.php`, `composer.json`, `.env.example`

