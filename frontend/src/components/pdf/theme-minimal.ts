import { defaultPrimitives } from "./primitives"
import type { PdfcnTheme } from "./types/theme-types"

/**
 * Catering Nusantara theme preset.
 *
 * Character: earth-tone hospitality — olive primary, warm paper background.
 * OKLCH values are synced 1:1 with `src/index.css` (:root tokens) so the
 * generated PDF feels like a seamless extension of the website.
 * Takumi renders via browser CSS, which supports oklch() natively.
 *
 * Fonts mirror the web brand: Fraunces headings, Space Grotesk body,
 * Instrument Serif accents (loaded via @takumi-rs/helpers googleFonts).
 */
export const minimalTheme: PdfcnTheme = {
  colors: {
    accent: "oklch(0.8348 0.0426 88.8064)",
    background: "oklch(0.9582 0.0152 90.2357)",
    border: "oklch(0.8606 0.0321 84.5881)",
    destructive: "oklch(0.5471 0.1438 32.9149)",
    foreground: "oklch(0.376 0.0225 64.3434)",
    info: "oklch(0.5391 0.0387 71.1655)",
    muted: "oklch(0.9914 0.0098 87.4695)",
    mutedForeground: "oklch(0.5391 0.0387 71.1655)",
    primary: "oklch(0.5628 0.0778 65.5444)",
    primaryForeground: "oklch(1 0 0)",
    success: "oklch(0.5604 0.0624 68.5805)",
    warning: "oklch(0.8348 0.0426 88.8064)",
  },
  name: "catering-nusantara",
  page: {
    orientation: "portrait",
    size: "A4",
  },
  primitives: defaultPrimitives,
  spacing: {
    componentGap: 18,
    page: {
      marginBottom: 72,
      marginLeft: 56,
      marginRight: 56,
      marginTop: 72,
    },
    paragraphGap: 14,
    sectionGap: 36,
  },
  typography: {
    body: {
      fontFamily: "Space Grotesk",
      fontSize: 11,
      lineHeight: 1.65,
    },
    heading: {
      fontFamily: "Fraunces",
      fontSize: {
        h1: 24,
        h2: 20,
        h3: 16,
        h4: 14,
        h5: 12,
        h6: 10,
      },
      fontWeight: 600,
      lineHeight: 1.25,
    },
  },
}
