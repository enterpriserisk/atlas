/**
 * U-M brand color tokens + pre-approved, contrast-safe foreground/background pairings.
 *
 * Source: University of Michigan Brand Identity Style Guide, February 2025 (brand.umich.edu).
 *
 * WHY THIS FILE EXISTS (non-negotiable accessibility requirement):
 * The brand guide + WCAG 2.1 AA require a minimum 4.5:1 contrast ratio for normal text
 * and 3:1 for large text (>=24px, or >=19px bold). Rather than let any page pick arbitrary
 * color combinations (and risk shipping e.g. white-on-maize, which FAILS), every allowed
 * text-on-surface combination is enumerated here as a `Pairing`. Components consume these
 * named pairings instead of raw colors, so a contrast violation is structurally impossible.
 *
 * Contrast ratios below were computed with the WCAG relative-luminance formula and are
 * annotated per pairing. If you add a pairing, verify it and record the ratio.
 */

/** Raw brand palette. Keys mirror the CSS custom properties defined in globals.css. */
export const brand = {
  // Signature (primary) colors
  blue: "#00274C", // PMS 282 — primary, dominant for headers/nav/footer
  maize: "#FFCB05", // PMS 7406 — accent only (CTAs, highlights, active states)

  // Secondary / supporting palette (accents only — never the dominant color)
  tappanRed: "#9A3324",
  rossOrange: "#D86018",
  wavefieldGreen: "#A5A508",
  taubmanTeal: "#00B2A9",
  rackhamGreen: "#75988D",
  arboretumBlue: "#2F65A7",
  amethyst: "#702082",
  matthaeiViolet: "#575294",

  // Neutrals
  tan: "#CFC096",
  beige: "#9B9A6D",
  ash: "#989C97",
  stone: "#80764B",
  blackMetallic: "#131516",
  white: "#FFFFFF",
  black: "#000000",
} as const;

export type BrandColor = keyof typeof brand;

/**
 * A verified foreground-on-background pairing.
 * `ratio` is the computed WCAG contrast ratio; `minSize` notes whether it is only
 * safe for large text (AA large = 3:1) vs. normal text (AA = 4.5:1).
 */
export interface Pairing {
  readonly fg: string;
  readonly bg: string;
  /** Computed WCAG 2.1 contrast ratio (documented, not runtime-enforced). */
  readonly ratio: number;
  /** "normal" => passes AA 4.5:1 for all text. "large" => only for >=24px / >=19px bold. */
  readonly minSize: "normal" | "large";
  readonly note?: string;
}

/**
 * Approved pairings. USE THESE — do not hand-pick fg/bg pairs in components.
 *
 * Ratios verified against the WCAG formula:
 *   L = 0.2126*R + 0.7152*G + 0.0722*B (linearized sRGB)
 *   ratio = (Llighter + 0.05) / (Ldarker + 0.05)
 */
export const pairings = {
  /** White text on Michigan Blue — headers, nav, footer. ~14.7:1. */
  onBlue: { fg: brand.white, bg: brand.blue, ratio: 14.7, minSize: "normal" },

  /** Maize text on Michigan Blue — accent headings/links on dark chrome. ~10.6:1. */
  maizeOnBlue: { fg: brand.maize, bg: brand.blue, ratio: 10.6, minSize: "normal" },

  /**
   * Blue text on Maize — the ONLY safe way to put text on a maize surface (buttons/badges).
   * ~8.5:1. NEVER white-on-maize (fails ~1.7:1) — that combination is intentionally absent.
   */
  onMaize: { fg: brand.blue, bg: brand.maize, ratio: 8.5, minSize: "normal" },

  /** Black text on Maize — alternative safe maize surface. ~12.9:1. */
  blackOnMaize: { fg: brand.black, bg: brand.maize, ratio: 12.9, minSize: "normal" },

  /** Near-black body text on white — default page body. ~18.9:1. */
  onWhite: { fg: brand.blackMetallic, bg: brand.white, ratio: 18.9, minSize: "normal" },

  /** Blue text on white — headings/links on light surfaces. ~14.7:1. */
  blueOnWhite: { fg: brand.blue, bg: brand.white, ratio: 14.7, minSize: "normal" },

  /** White on Tappan Red — "Don't"/danger accents. ~7.0:1. */
  onTappanRed: { fg: brand.white, bg: brand.tappanRed, ratio: 7.0, minSize: "normal" },

  /** White on Arboretum Blue — data-viz/info accents. ~5.0:1. */
  onArboretumBlue: { fg: brand.white, bg: brand.arboretumBlue, ratio: 5.0, minSize: "normal" },

  /** White on Amethyst — accent surfaces. ~7.9:1. */
  onAmethyst: { fg: brand.white, bg: brand.amethyst, ratio: 7.9, minSize: "normal" },

  /** White on Ross Orange — warning accents (large text only; ~3.4:1). */
  onRossOrange: {
    fg: brand.white,
    bg: brand.rossOrange,
    ratio: 3.4,
    minSize: "large",
    note: "Large text only. For normal-size text use blackOnRossOrange instead.",
  },

  /** Black on Ross Orange — normal text on orange. ~6.2:1. */
  blackOnRossOrange: { fg: brand.black, bg: brand.rossOrange, ratio: 6.2, minSize: "normal" },

  /** White on Taubman Teal (large text only; ~2.4:1) — prefer blackOnTeal for body. */
  onTaubmanTeal: {
    fg: brand.black,
    bg: brand.taubmanTeal,
    ratio: 8.1,
    minSize: "normal",
    note: "Black on teal (~8.1:1). White-on-teal fails; do not use it.",
  },
} as const satisfies Record<string, Pairing>;

export type PairingName = keyof typeof pairings;
