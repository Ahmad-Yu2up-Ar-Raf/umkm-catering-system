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
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "assets", "images");

const HERO = "banners/hero-banner-tumpeng.png";
const HERO_WIDTHS = [640, 1024, 1920];
const CARDS = [
  // Verified present 2026-09-19 (older PSI names like
  // paket-prasmanan-makanan1.png / paket-tumpeng.png no longer exist locally —
  // those slots are Cloudinary-served via API + MediaItem f_auto,q_auto).
  "products/paket-tumpeng-mini/paket-tumpeng-mini-2.png",
  "products/paket-tumpeng-mini/paket-tumpeng-mini-3.png",
  "products/paket-prasmanan-korporat/paket-prasmanan-korporat-1.png",
  "products/paket-prasmanan-korporat/paket-prasmanan-korporat-2.png",
  "products/paket-prasmanan-nikahan/paket-prasmanan-nikahan-2.png",
  "products/paket-prasmanan-nikahan/paket-prasmanan-nikahan-3.png",
  "products/paket-snack-box-arisan/paket-snack-box-arisan-2.png",
  "products/paket-nasi-box-hemat/paket-nasi-box-hemat-2.png",
  "products/paket-nasi-box-hemat/paket-nasi-box-hemat-3.png",
  "lifestyle/corporate-lunch-box-overhead-lifestyle.png",
  "lifestyle/wedding-buffet-lifestyle-shot.png",
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
  writeManifest();
}

/**
 * Manifest for the runtime `<picture>` injection in MediaItem: maps each
 * ORIGINAL local path ("/assets/images/...png") to the generated next-gen
 * srcsets. Regenerated on every run — checked in, strictly typed, no `any`.
 * Files with no generated siblings are simply absent (callers fall back).
 */
function writeManifest() {
  const imagesRoot = join(root);
  const groups = new Map();
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) { walk(abs); continue; }
      const m = /^(.*)-(640|1024|1920|opt)\.(webp|avif)$/.exec(entry.name);
      if (!m) continue;
      const [, base, width, ext] = m;
      const relDir = relative(imagesRoot, dir).split(sep).join("/");
      const prefix = relDir ? `${relDir}/` : "";
      // Resolve the original: try .png then .jpg next to the variant.
      const orig = [".png", ".jpg"].map((e) => join(dir, `${base}${e}`)).find((p) => existsSync(p));
      if (!orig) continue;
      const origRel = `/assets/images/${prefix}${base}${extname(orig)}`;
      const variantRel = `/assets/images/${prefix}${entry.name}`;
      if (!groups.has(origRel)) groups.set(origRel, []);
      groups.get(origRel).push({ width: width === "opt" ? 0 : Number(width), ext, variantRel });
    }
  };
  walk(imagesRoot);

  const lines = [
    "/** Generated by scripts/optimize-images.mjs — do not edit by hand. */",
    "/** Next-gen srcsets for a local image; absent fields have no sibling. */",
    "export type LocalImageVariant = {",
    "  avifSrcSet?: string;",
    "  webpSrcSet?: string;",
    "};",
    "/** Original local path → generated srcsets (width descriptors included). */",
    "export const LOCAL_IMAGE_VARIANTS: Record<string, LocalImageVariant> = {",
  ];
  for (const [orig, variants] of [...groups.entries()].sort()) {
    const byExt = (e) =>
      variants
        .filter((v) => v.ext === e && v.width > 0)
        .sort((a, b) => a.width - b.width)
        .map((v) => `${v.variantRel} ${v.width}w`)
        .join(", ");
    const single = (e) => {
      const v = variants.find((x) => x.ext === e && x.width === 0);
      return v ? v.variantRel : "";
    };
    const avif = byExt("avif") || single("avif");
    const webp = byExt("webp") || single("webp");
    lines.push(`  ${JSON.stringify(orig)}: {`);
    if (avif) lines.push(`    avifSrcSet: ${JSON.stringify(avif)},`);
    if (webp) lines.push(`    webpSrcSet: ${JSON.stringify(webp)},`);
    lines.push("  },");
  }
  lines.push("};", "");
  // imagesRoot = <root>/public/assets/images → up 3 = project root, then src/lib.
  const outPath = join(imagesRoot, "..", "..", "..", "src", "lib", "local-image-variants.ts");
  writeFileSync(outPath, lines.join("\n"));
  console.log(`manifest: ${groups.size} mapped images → ${relative(process.cwd(), outPath)}`);
}

main();
