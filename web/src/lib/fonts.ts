import { Archivo, Cormorant_Garamond, DM_Mono } from "next/font/google";

// The site's three faces, one job each. Self-hosted at build time rather than
// fetched from Google at runtime: one less render-blocking request and no
// layout shift from a late font swap. The variables are set on <html> by the
// root layout and mapped to font-title / font-subtitle / font-body in
// globals.css, which is the only place components should reach them from.

// Titles: headings and display type. The real italic is what the h1/h2
// default uses (globals.css), so the browser never has to fake a slant.
export const titleFont = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
});

// Subtitles: eyebrows, kickers and metadata, set uppercase and tracked.
export const subtitleFont = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-mono",
});

// Body: paragraphs, buttons, links, form fields and the rest of the UI.
export const bodyFont = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});
