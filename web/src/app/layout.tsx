import type { Metadata } from "next";
import { Archivo, Gilda_Display } from "next/font/google";
import "./globals.css";

// Self-hosted at build time rather than fetched from Google at runtime: one
// less render-blocking request and no layout shift from a late font swap.
const gilda = Gilda_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-gilda",
});

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5173",
  ),
  title: {
    default: "Photography Portfolio",
    template: "%s | Photography Portfolio",
  },
  description:
    "Documentary and travel photography from Nepal, India and Myanmar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${gilda.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
