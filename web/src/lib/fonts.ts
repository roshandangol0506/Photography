import { Pinyon_Script } from "next/font/google";

// The formal script used for the large section titles ("Cosmos", "Projects"),
// and the public site's default for h1 and h2 (globals.css). Its variable is
// set on <html> by the root layout; one module, so every use shares the same
// font file.
export const scriptFont = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-script",
});
