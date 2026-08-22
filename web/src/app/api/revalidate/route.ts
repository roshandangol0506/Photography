import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

/** Tags the public fetchers register in lib/content.ts. */
const KNOWN_TAGS = new Set([
  "settings",
  "photos",
  "categories",
  "collections",
  "awards",
  "testimonials",
]);

/**
 * Purges ISR caches after an admin write.
 *
 * Gated on an admin session for the same reason any mutation is: cache
 * purging is cheap to request and expensive to serve, so leaving it open
 * would hand anyone a way to force every public page to re-render on demand.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const requested: unknown = body?.tags;

  if (!Array.isArray(requested)) {
    return Response.json({ message: "tags must be an array" }, { status: 400 });
  }

  // Only tags this app actually registers - an unknown string would be a
  // silent no-op that looks like it worked.
  const tags = requested.filter(
    (tag): tag is string => typeof tag === "string" && KNOWN_TAGS.has(tag),
  );

  // Next 16 requires a cache-life profile alongside the tag. `expire: 0`
  // marks the entries stale immediately rather than at the end of some named
  // profile's window, which is the whole point of an on-demand purge.
  tags.forEach((tag) => revalidateTag(tag, { expire: 0 }));

  return Response.json({ revalidated: tags });
}
