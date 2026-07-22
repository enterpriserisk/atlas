import { IBM_Plex_Sans, Montserrat, Atkinson_Hyperlegible } from "next/font/google";

/**
 * Typography per the U-M Brand Identity Style Guide (Feb 2025).
 * - Body/UI: IBM Plex Sans (free, brand-approved)
 * - Headings/display: Montserrat
 * - High-legibility accessibility mode: Atkinson Hyperlegible (Braille Institute typeface,
 *   recommended by the brand guide's accessibility section), user-toggleable in the header.
 *
 * Max 2–3 fonts per the guide. All loaded via next/font (self-hosted, no external
 * requests, font-display: swap by default) exposed as CSS variables consumed in globals.css.
 */

export const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const headingFont = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

export const legibilityFont = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-legibility",
  display: "swap",
});

export const fontVariables = `${bodyFont.variable} ${headingFont.variable} ${legibilityFont.variable}`;
