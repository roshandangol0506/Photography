import "server-only";

/**
 * Server-side API client.
 *
 * The Express API is guarded by an api-key header. In the Vite app that key
 * shipped to every browser as VITE_API_KEY; here it is read from a non-public
 * env var and only ever used inside Server Components, Route Handlers and
 * middleware, so it never reaches the client bundle.
 */

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001/api";
const API_KEY = process.env.API_KEY ?? "";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  perpage: number;
}

type Query = Record<string, string | number | boolean | undefined>;

interface FetchOptions {
  /** Seconds before Next revalidates this response. */
  revalidate?: number;
  /** Cache tags, so an admin mutation can invalidate exactly what changed. */
  tags?: string[];
  /** Bearer token for admin-only endpoints. */
  token?: string;
  query?: Query;
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(
    path.startsWith("/") ? path.slice(1) : path,
    API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`,
  );
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

/**
 * Returns null rather than throwing on a failed request: a missing testimonial
 * list should hide one section, not blank the whole page. Callers that need to
 * distinguish "empty" from "broken" can check for null.
 */
export async function apiGet<T>(
  path: string,
  { revalidate = 300, tags, token, query }: FetchOptions = {},
): Promise<T | null> {
  try {
    const response = await fetch(buildUrl(path, query), {
      headers: {
        apiKey: API_KEY,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate, tags },
    });

    if (!response.ok) return null;

    const body = (await response.json()) as ApiResponse<T>;
    return body.data ?? null;
  } catch {
    return null;
  }
}
