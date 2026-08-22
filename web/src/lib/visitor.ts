const COOKIE_KEY = "uniqueID";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readCookie(key: string) {
  const match = document.cookie
    .split(";")
    .find((entry) => entry.trim().startsWith(`${key}=`));
  return match ? match.split("=")[1] : null;
}

/**
 * Stable per-browser id for likes and comments.
 *
 * Same cookie name and `uuid_timestamp` format as the Vite app, so existing
 * visitors keep their identity and their likes. Dropped `clientjs` (used only
 * for a cookie-support check) and `uuid` in favour of crypto.randomUUID -
 * two fewer packages in the public bundle.
 */
export function getVisitorId(): string {
  const existing = readCookie(COOKIE_KEY);
  if (existing && UUID_PATTERN.test(existing.split("_")[0])) return existing;

  const created = `${crypto.randomUUID()}_${Date.now()}`;
  try {
    document.cookie = `${COOKIE_KEY}=${created};max-age=${ONE_YEAR_SECONDS};path=/;SameSite=Lax`;
  } catch {
    // Cookies disabled - the id still works for this page view.
  }
  return created;
}
