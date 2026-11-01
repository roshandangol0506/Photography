import type { Metadata } from "next";
import { bodyFont, subtitleFont, titleFont } from "@/lib/fonts";
import "./globals.css";

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
    <html
      lang="en"
      className={`${titleFont.variable} ${subtitleFont.variable} ${bodyFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
