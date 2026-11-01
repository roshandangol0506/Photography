import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The site's type tokens (globals.css). Without them tailwind-merge reads
// `text-caption` as a text colour and drops it next to `text-md-red`, and
// can't tell `font-title` (a family) from `font-medium` (a weight).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-family": [{ font: ["title", "subtitle", "body"] }],
      "font-size": [
        {
          text: [
            "display",
            "title-1",
            "title-2",
            "title-3",
            "title-4",
            "lead",
            "body",
            "small",
            "caption",
            "subtitle",
            "label",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
