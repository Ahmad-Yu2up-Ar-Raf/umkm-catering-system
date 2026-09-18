/**
 * One-shot local raster diet — RUN ONCE LOCALLY, never in CI/Vercel build.
 *
 * Why standalone: public/assets is ~204 MB. Running sharp inside the Vite
 * build (vite-plugin-image-optimizer) would OOM/timeout the Vercel build.
 * Instead, generate .webp/.avif siblings ahead of time and commit the small
 * outputs; the build then ships the already-optimized files.
 *
 * Usage:
 *   npm i -D sharp   # local only — do NOT add to build dependencies
 *   node scripts/optimize-images.mjs
 *
 * What it does (idempotent — skips up-to-date outputs):
 *   - hero-banner-tumpeng.png → 640/1024/1920w .webp (q80) + .avif (q60)
 *   - top-5 catalog PNGs      → 640w .webp (q80) + .avif (q60)
 *   - songket2.jpg marquee    → downscale ≤1600px wide + .webp (q75)
 *
 * After running, update the index.html LCP preload to the 1024w .webp and
 * wire ParallaxMotionBackground / MediaItem to the srcset siblings (P1.3).
 */
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "assets", "images");

const HERO = "banners/hero-banner-tumpeng.png";
const HERO_WIDTHS = [640, 1024, 1920];
const CARDS = [
  "products/paket-tumpeng-mini/paket-tumpeng-mini-2.png",
  "products/paket-prasmanan-makanan/paket-prasmanan-makanan1.png",
  "products/paket-prasmanan-korporat/paket-prasmanan-korporat-2.png",
  "products/paket-tumpeng/paket-tumpeng.png",
];
const MARQUEE = "patern/songket2.jpg";

async function loadSharp() {
  try {
    return (await import("sharp")).default;
  } catch {
    console.error("sharp is not installed. Run `npm i -D sharp` locally, then re-run this script.");
    process.exit(1);
  }
}

async function main() {
  const sharp = await loadSharp();
  let written = 0;
  let skipped = 0;

  const out = (rel) => {
    const p = join(root, rel);
    mkdirSync(dirname(p), { recursive: true });
    return p;
  };

  // Hero responsive set.
  for (const w of HERO_WIDTHS) {
    for (const [ext, opts] of [["webp", { quality: 80 }], ["avif", { quality: 60 }]]) {
      const target = out(HERO.replace(".png", `-${w}.${ext}`));
      if (existsSync(target)) { skipped++; continue; }
      await sharp(join(root, HERO)).resize(w).toFormat(ext, opts).toFile(target);
      written++;
      console.log("wrote", target);
    }
  }

  // Catalog cards — single 640w rendition each (displayed ≤480px wide).
  for (const rel of CARDS) {
    const src = join(root, rel);
    if (!existsSync(src)) { console.warn("missing source, skipping:", src); continue; }
    for (const [ext, opts] of [["webp", { quality: 80 }], ["avif", { quality: 60 }]]) {
      const target = out(rel.replace(".png", `-640.${ext}`));
      if (existsSync(target)) { skipped++; continue; }
      await sharp(src).resize(640).toFormat(ext, opts).toFile(target);
      written++;
      console.log("wrote", target);
    }
  }

  // Marquee tile — downscale source width, then webp.
  const marqueeTarget = out(MARQUEE.replace(".jpg", "-opt.webp"));
  if (existsSync(marqueeTarget)) {
    skipped++;
  } else {
    await sharp(join(root, MARQUEE)).resize(1600).webp({ quality: 75 }).toFile(marqueeTarget);
    written++;
    console.log("wrote", marqueeTarget);
  }

  console.log(`done: ${written} written, ${skipped} already up-to-date.`);
}

main();
