import { Pinyon_Script } from "next/font/google";

// The formal script used for the large section titles ("Cosmos", "Projects").
// Kept out of the root layout so only the pages that use it download it, and
// in one module so every section that uses it shares the same font file.
export const scriptFont = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
