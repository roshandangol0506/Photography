import axios from "axios";

/**
 * Browser-side API client. Points at the Next proxy rather than Express
 * directly, so no api-key and no bearer token exist in client code - the
 * proxy adds both from server-only env and the HttpOnly cookie.
 */
export const api = axios.create({ baseURL: "/api/proxy" });

/**
 * Auth deliberately bypasses the proxy. Only a Next route handler can set or
 * clear an HttpOnly cookie, so login, OTP and logout have their own endpoints
 * rather than being forwarded straight through to Express.
 */
export const authApi = axios.create({ baseURL: "/api/auth" });

/**
 * Which cached fetches a write invalidates.
 *
 * Editing a category also purges photos: the photo payload embeds its
 * category name, so a rename would otherwise linger on the home page and in
 * the gallery until the ISR window expired.
 *
 * Deliberately absent: likes, comments, visitors and messages. Those change
 * often and only move counters that the existing 2-minute window already
 * refreshes - purging on every like would mean re-rendering the site all day.
 */
const TAGS_BY_RESOURCE: Record<string, string[]> = {
  photos: ["photos"],
  categories: ["categories", "photos"],
  collections: ["collections"],
  awards: ["awards"],
  testimonials: ["testimonials"],
  settings: ["settings"],
};

const MUTATIONS = new Set(["post", "put", "patch", "delete"]);

/**
 * After any successful admin write, purge the matching ISR caches so the
 * public site reflects the change immediately rather than after the
 * revalidate window. One interceptor covers every mutation hook, including
 * ones added later.
 */
api.interceptors.response.use(async (response) => {
  const method = (response.config.method ?? "get").toLowerCase();
  if (!MUTATIONS.has(method)) return response;

  const path = (response.config.url ?? "").replace(/^\/+/, "");
  const resource = path.split("/")[0];
  const tags = TAGS_BY_RESOURCE[resource];
  if (!tags) return response;

  // Fire and forget: a failed purge must never fail the write the user just
  // made. Worst case the page refreshes on its normal schedule.
  void fetch("/api/revalidate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tags }),
  }).catch(() => {});

  return response;
});

export default api;
