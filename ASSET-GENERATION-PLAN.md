# ASSET-GENERATION-PLAN — Catering Nusantara Product Mockups

## 1. Project Overview

**Business:** Catering Nusantara (Dapur Bunda Catering), Bogor, sejak 2019. Katalog hybrid: 5 paket katering (Nasi Box, Prasmanan Pernikahan, Snack Box, Tumpeng Mini, Prasmanan Korporat) → konversi ke WhatsApp.

**Visual Goal:** 5 highly-consistent, HD (2K), square product mockups in the bright, clean "lunchbox" style of **Dapur Solo** — pure-white background, high-key natural light, honest home-cooked Nusantara look. Current product photos (light green/yellow/beige backgrounds) are inconsistent; this restyles them into one photoshoot.

**Deliverable:** `assets/products/` — 5 square, HD (2048×2048) mockups; extension is mime-derived (`.png`/`.jpg` per model — see §4.5).

## 2. Visual Rulebook ("The Photosynthesis Capsule")

Applied to **every** prompt verbatim to guarantee one consistent photoshoot. Derived from measurement of the Dapur Solo reference set (white `#FEFEFE` border, brightness ≈220, warm palette).

| Element | Rule |
|---|---|
| **Aspect / crop** | Square **1:1** (matches IG + Dapur Solo + client's 1080px shots) |
| **Angle** | **45° top-down** (three-quarter overhead), subject centered, generous white negative space |
| **Background** | Seamless **pure bright white `#FEFEFE`** — zero gray/beige/tint, evenly lit edge-to-edge, soft reflected shadow under container only |
| **Lighting** | Soft diffused natural window daylight from **upper-left**, high-key bright exposure (~brightness 215–225), no hard shadows, no glare |
| **Lens / DOF** | **50mm, f/3.5**, shallow depth of field, sharp focus on main dish, creamy natural bokeh behind |
| **Palette** | Warm earth tones (brand = warm charcoal-black + cream + white); rice white, turmeric gold, rendang deep brown, red chili accents |
| **Texture / props** | Banana leaf (`daun pisang`) liners, fresh red chilies, coriander garnish, small sambal bowl; **no hands, no text, no logo, no watermark, no cutlery, no distracting props** |
| **Mood** | "Down to Earth" Nusantara — honest home-kitchen, **not** fine-dining plating; faint steam on hot dishes |
| **Quality** | Photorealistic, 4K-grade detail, high dynamic range |

**Branding strategy (LOCKED DECISION):** **TEXT-FREE GENERATION.** The generator is Pollinations.ai-based: reference-capable models (`nanobanana`, `kontext`, `gptimage`, …) accept `--image` for style references. **The logo is NEVER generated in-image** — AI-rendered logo/text garbles and breaks cross-shot consistency. Instead the real `assets/bisnis/logo.png` is **overlaid onto the packaging** as a separate, guaranteed step (frontend CSS overlay is the preferred path; post-production compositing as fallback — see §6). Never ask the model to render text/labels/logos. *If in-image branding is ever required, it needs a new decision (nanobanana renders short text but risks inconsistent fonts across the set).*

**Menu-accuracy rule:** every ingredient from the seeder **must** appear as an explicit visual token (e.g. "Nasi Kuning" ⇒ "vivid turmeric-yellow rice"; "Sayur Sop" ⇒ "clear soup with carrot, potato, cabbage"). After each generation, verify against the QA checklist (§5); regenerate with a nudged prompt if anything is missing.

## 3. The 5 Engineered Prompts

> Each = full, copy-paste-ready prompt (shared capsule + package block). Run from repo root.

### Shared Capsule (prepend to each)

```
Professional studio e-commerce product photography for an Indonesian catering brand. Square 1:1 composition, 45-degree top-down angle, subject perfectly centered with generous negative space. Background must be pure bright white #FEFEFE with zero gray, beige, or color tint — a seamless bright-white studio backdrop, evenly lit edge to edge. Soft diffused natural window daylight from the upper left, high-key bright airy exposure around 220 brightness, one soft subtle shadow directly under the container only, no vignette, no harsh shadows, no glare. Shot on a 50mm lens at f/3.5, shallow depth of field, tack-sharp focus on the main dish, creamy natural bokeh. Warm realistic colors, glossy fresh texture, light steam rising from hot dishes. Styled with a thin banana-leaf liner, fresh red chili and coriander garnish, and a small ceramic bowl of sambal. No text, no logos, no watermarks, no hands, no cutlery, no distracting props. Honest home-cooked Nusantara aesthetic, not fine-dining plating. Photorealistic, crisp clean focus, high dynamic range.
```

### Prompt 1 — Paket Nasi Box Hemat *(hero: best seller)*

```
[SHARED CAPSULE]
Single-portion food-grade kraft paper lunch box, open with the lid angled beside it, holding: a mound of fluffy white steamed rice; one golden-brown crispy fried chicken leg quarter (ayam goreng) with crunchy skin; a small pile of tempe orek (sweet soy-spiced stir-fried tempeh strips, deep caramel brown, glossy); a small clear soup cup of sayur sop (broth with carrot, potato, green beans, cabbage); a few pink shrimp crackers (kerupuk udang) tucked on the side; one small glass of mineral water standing beside the box. Everyday economical office-lunch feel, clean and appetizing.
```

### Prompt 2 — Paket Prasmanan Pernikahan

```
[SHARED CAPSULE]
Elegant wedding buffet spread on a white tablecloth, centered, featuring stainless-steel chafing dishes with lids open: beef rendang (dark glossy caramelized beef in rich coconut sauce) in a white ceramic bowl; ayam bakar (grilled chicken with charred caramel glaze); whole fried snapper in glossy orange-red sweet-and-sour sauce (ikan asam manis) with red bell pepper and pineapple; sayur lodeh (creamy coconut-milk vegetable stew with green beans, chayote, carrots); a cone of white rice; a plate of fruit potong (watermelon, melon, papaya slices); one serving of creamy vanilla pudding and one glass of es buah (iced mixed-fruit drink with syrup); kerupuk and a bowl of sambal terasi. A subtle white floral accent and a folded banana-leaf liner for warmth. Wedding-elegant yet bright and clean, matching the pure-white high-key style.
```

### Prompt 3 — Paket Snack Box Arisan

```
[SHARED CAPSULE]
A small clear plastic (mika) snack box with a fitted lid, filled with an arranged row of traditional Indonesian snacks: one fried risoles roll (golden breadcrumb, cut to show the filling), one crispy lumpia spring roll, one square of layered kue lapis (green and white steamed layers), one flaky fried pastel pastry stuffed with vegetables. A tiny chilled bottle of mineral water beside the box. Gentle, festive, home-style afternoon-snack mood, everything bright and fresh on the pure-white background.
```

### Prompt 4 — Paket Tumpeng Mini *(signature / hero shot)*

```
[SHARED CAPSULE]
A small tumpeng cone of vivid turmeric-yellow nasi kuning (fragrant yellow rice) with a neat cone shape, served on a round woven bamboo tampah tray lined with fresh banana leaves. Around the cone, arranged like a wreath: ayam suwir (savory shredded spiced chicken), wedges of telur balado (fried eggs in glossy red-orange chili balado sauce), crispy tempe kering (sweet caramelized tempeh chips), a small bowl of sambal goreng ati (liver in coconut sambal), sweet acar pickles (cucumber and carrot), and a few kerupuk. Light steam rising off the warm yellow rice, glossy and celebratory — the proud signature dish, shot in the same bright pure-white high-key style.
```

### Prompt 5 — Paket Prasmanan Korporat

```
[SHARED CAPSULE]
Formal corporate buffet spread on a white tablecloth, centered, stainless-steel chafing dishes with lids open: chicken cordon bleu (golden fried chicken breast, one cut open to reveal the ham and melted cheese filling), beef teriyaki (glazed beef slices with glossy dark sauce, sprinkled with white sesame), capcay (stir-fried vegetables — broccoli, carrot, cauliflower — crisp and colorful), a tray of chocolate pudding in small cups, a bowl of fluffy white rice with a serving of nasi goreng (fried rice) beside it, and a glass of mineral water. Minimal, modern, corporate-clean styling with a single green leaf accent and a folded banana-leaf liner — brighter and more neutral than the wedding spread, but in the exact same pure-white high-key photography style.
```

## 4. Execution Commands

> Tool: `node ~/.opencode/tools/image-generator/generate.js` (Pollinations.ai — migrated from Gemini).
> Current flags: `--prompt --model --width --height --seed --safe --quality --image --transparent --out --json --show-prompt --no-humanize --test`.
> Default model: env `POLLINATIONS_DEFAULT_MODEL`, else `flux`. Default size 1024×1024. Humanization ON by default.

### 4.1 Model strategy

Reference-image (`--image`) support is **model-gated** (verified against the live `gen.pollinations.ai/image/models` registry, `input_modalities`):

| Model | `--image` support | completion rate (pollen/image-token) |
|---|---|---|
| `flux` (default) | ❌ text only | 0.002 |
| `zimage` | ❌ text only | 0.004 |
| **`nanobanana`** (Google) | ✅ text+image | 0.00003 |
| `kontext` (BFL, style-transfer) | ✅ text+image | 0.04 |
| `gptimage` | ✅ text+image | 0.000006 |
| `seedream5` / `wan-image` (2K + refs) | ✅ text+image | 0.035 / 0.03 |

- **PRIMARY PATH = Recipe B (`--model=nanobanana`)** — reference-capable, effectively free (0.00003), and best-in-class instruction-following on ingredient accuracy. Chosen over kontext (whose output had a gray background + ingredient blend; also clamps to 1024²).
- **`seedream5` / `wan-image`** are the upgrade path if 2K output or a cleaner background is required (both support refs + 2K).
- `kontext` is retained as a secondary reference-capable option; `flux`/`zimage` are text-only fallbacks.
- If a model rejects 2048×2048, drop to `--width=1024 --height=1024`.

### 4.2 Reference mapping (STYLE REF ONLY — `produk-example-*` dropped)

The `produk-example-N.png` menu-accuracy refs are **REMOVED** — QA showed they contaminate the dish composition (the model blended their sauces/ingredients into the output). Menu accuracy now comes **100% from the explicit text descriptions in §3** (which exactly mirror the seeder data). Only the locked Dapur Solo style reference is passed.

| Pkg | Style ref (same for all 5) |
|---|---|
| Nasi Box Hemat | `assets/inspiration/dapur-solo-menu-exampel-1.png` |
| Prasmanan Pernikahan | `assets/inspiration/dapur-solo-menu-exampel-1.png` |
| Snack Box Arisan | `assets/inspiration/dapur-solo-menu-exampel-1.png` |
| Tumpeng Mini | `assets/inspiration/dapur-solo-menu-exampel-1.png` |
| Prasmanan Korporat | `assets/inspiration/dapur-solo-menu-exampel-1.png` |

Local `--image` paths now work via the patched tool (upload → `media.pollinations.ai`, §4.5).

### 4.3 Recipe A — `flux` fallback (no reference images, `--no-humanize`)

```bash
# Pre-flight (from repo root /mnt/c/Dev/Web/catering)
node ~/.opencode/tools/image-generator/generate.js --test

node ~/.opencode/tools/image-generator/generate.js \
  --prompt="<PROMPT_1>" --model=flux --width=2048 --height=2048 --seed=1001 --json --no-humanize \
  --out=/mnt/c/Dev/Web/catering/assets/products/paket-nasi-box-hemat
# … repeat for paket-prasmanan-pernikahan (--seed=1002), paket-snack-box-arisan (--seed=1003),
# paket-tumpeng-mini (--seed=1004), paket-prasmanan-korporat (--seed=1005) — prompts in §3
```

### 4.4 Recipe B — `nanobanana` with style reference (PRIMARY)

```bash
# Pre-flight (from repo root /mnt/c/Dev/Web/catering)
node ~/.opencode/tools/image-generator/generate.js --test

# 1) Paket Nasi Box Hemat — style-lock ref only; local path auto-uploaded (tool patched)
node ~/.opencode/tools/image-generator/generate.js \
  --prompt="<PROMPT_1>" --model=nanobanana --width=2048 --height=2048 --seed=1001 --json --no-humanize \
  --image="assets/inspiration/dapur-solo-menu-exampel-1.png" \
  --out=/mnt/c/Dev/Web/catering/assets/products/paket-nasi-box-hemat

# 2) Paket Prasmanan Pernikahan
node ~/.opencode/tools/image-generator/generate.js \
  --prompt="<PROMPT_2>" --model=nanobanana --width=2048 --height=2048 --seed=1002 --json --no-humanize \
  --image="assets/inspiration/dapur-solo-menu-exampel-1.png" \
  --out=/mnt/c/Dev/Web/catering/assets/products/paket-prasmanan-pernikahan

# 3) Paket Snack Box Arisan
node ~/.opencode/tools/image-generator/generate.js \
  --prompt="<PROMPT_3>" --model=nanobanana --width=2048 --height=2048 --seed=1003 --json --no-humanize \
  --image="assets/inspiration/dapur-solo-menu-exampel-1.png" \
  --out=/mnt/c/Dev/Web/catering/assets/products/paket-snack-box-arisan

# 4) Paket Tumpeng Mini (signature / hero)
node ~/.opencode/tools/image-generator/generate.js \
  --prompt="<PROMPT_4>" --model=nanobanana --width=2048 --height=2048 --seed=1004 --json --no-humanize \
  --image="assets/inspiration/dapur-solo-menu-exampel-1.png" \
  --out=/mnt/c/Dev/Web/catering/assets/products/paket-tumpeng-mini

# 5) Paket Prasmanan Korporat
node ~/.opencode/tools/image-generator/generate.js \
  --prompt="<PROMPT_5>" --model=nanobanana --width=2048 --height=2048 --seed=1005 --json --no-humanize \
  --image="assets/inspiration/dapur-solo-menu-exampel-1.png" \
  --out=/mnt/c/Dev/Web/catering/assets/products/paket-prasmanan-korporat

# Upgrade path if background/resolution misses the bar:
#   --model=seedream5  or  --model=wan-image   (2K + refs; keep --no-humanize + style ref)

# 2) Verify
file assets/products/*
```

### 4.5 Notes (Pollinations-specific)

- **Cost (Pollen):** measured 2026-08 — **nanobanana @ 2048×2048 ≈ 0.039 pollen/image** (empirical, from a failed-run error message), so the full 5-image set ≈ 0.2 pollen. Kontext ≈ 0.04 pollen/image (clamped to 1024²). Registry rates: flux 0.002, zimage 0.004, kontext 0.04, nanobanana 0.00003, gptimage 0.000006, seedream5 0.035, wan-image 0.03 (per image-token). Balance is only readable from a failed run's error (`Insufficient balance. This request costs ~X pollen, but your available balance is Y`) — `--test` reports balance only if the key has `account:usage` permission (ours does not). Top-up at `https://enter.pollinations.ai` (or claim quests) before running.
- **Key type:** `sk_` (secret). Fetches use `Authorization: Bearer` — the key never appears in `--out` logs/URLs.
- **Output mime:** no `--format` flag — extension follows the returned `content-type` (png/jpg/webp/svg), auto-appended when `--out` has no extension. Expected: flux/kontext → typically `image/jpeg`; nanobanana → typically `image/png`. Verify per file via the `--json` `mime` field / saved filename.
- **Humanization:** **`--no-humanize` is REQUIRED for this project's product shots.** This is commercial product photography — humanization strips the capsule's style terms and injects "candid smartphone photo / slight motion blur" language that fights the clean commercial brief (verified harmful on the kontext run). All §4 commands include `--no-humanize`; do not remove it.
- **Reference upload:** tool patched (2026-08): local `--image` paths now upload to `media.pollinations.ai` (was `gen.pollinations.ai/upload` → 404). Comma-separated for multiple refs; full URLs accepted directly.
- **Output mime / resolution:** no `--format` flag — extension follows the returned `content-type` (png/jpg/webp/svg), auto-appended when `--out` has no extension. Expected: nanobanana → typically `image/png`; kontext/flux → typically `image/jpeg`. **Resolution caveat:** `kontext` clamps output to 1024×1024 regardless of request; verify actual dims after each run (`--json` reports requested, not actual — use `file`/pixel check). If 2048² is required, use `seedream5`/`wan-image`.
- **Deterministic filenames:** `--out` is a full file path (no `--name` flag anymore); extension is mime-derived, so final files are `assets/products/<slug>.(png|jpg)`.

## 5. Post-Generation QA Checklist (per image)

- [ ] Background ≈ pure bright white (`#FEFEFE`) — no gray/beige tint (pixel-check corners; threshold: ≥95% of border >244 per channel)
- [ ] Actual output resolution matches intent (e.g. 2048×2048; kontext clamps to 1024 — use seedream5/wan-image if 2K required)
- [ ] All seeder ingredients visually present (check §3 block for the package — 100% alignment enforced)
- [ ] No hands, garbled text, or hallucinated props
- [ ] Same 45° angle + lighting across all 5 (view as a set)
- [ ] Square, sharp, appetizing
- Regenerate a failing image with a nudged prompt (e.g. add missing dish name, raise/lower exposure) — never accept a missing-ingredient image.

## 6. Optional / Future

- **Logo overlay (guaranteed brand on packaging):** the real `assets/bisnis/logo.png` is composited onto the packaging as the delivery step — **frontend CSS overlay is the preferred path** (position the logo over the kraft box / tampah at display time), post-production compositing as fallback. This is the mechanism that guarantees "logo in the packaging" without risking garbled AI text.
- **Text variant experiment:** deferred — not in this round (LOCKED: text-free generation). Note: `nanobanana`/`nanobanana-2` (Google, first-party on Pollinations) render short text well — revisit only if the team explicitly decides to override the text-free lock.
