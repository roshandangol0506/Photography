import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

/**
 * Backend-for-frontend proxy.
 *
 * Everything the browser needs from Express goes through here. Two secrets are
 * attached server-side and never reach the client:
 *
 *   - the api-key that guards every /api route (previously shipped in the
 *     bundle as VITE_API_KEY, readable by anyone)
 *   - the admin bearer token, held in an HttpOnly cookie JavaScript cannot read
 *
 * Express remains the sole authentication and authorization authority; this
 * only carries credentials it already understands.
 */

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001/api";
const API_KEY = process.env.API_KEY ?? "";

export const TOKEN_COOKIE = "adminToken";

// Hop-by-hop and length headers must not be copied through a proxy.
const STRIPPED = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "accept-encoding",
]);

async function forward(request: NextRequest, path: string[]) {
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  const target = new URL(path.join("/"), base);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!STRIPPED.has(key.toLowerCase())) headers.set(key, value);
  });

  headers.set("apiKey", API_KEY);

  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (token) headers.set("authorization", `Bearer ${token}`);
  else headers.delete("authorization");

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  const response = await fetch(target, {
    method,
    headers,
    // Streamed rather than buffered so multipart photo uploads are not held
    // in memory twice. `duplex` is required by undici for a streaming body.
    body: hasBody ? request.body : undefined,
    ...(hasBody ? { duplex: "half" } : {}),
    cache: "no-store",
    redirect: "manual",
  } as RequestInit);

  const outgoing = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) outgoing.set("content-type", contentType);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: outgoing,
  });
}

type Context = { params: Promise<{ path: string[] }> };

const handler = async (request: NextRequest, context: Context) => {
  const { path } = await context.params;
  return forward(request, path);
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
