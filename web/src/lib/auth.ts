import "server-only";
import { cookies } from "next/headers";
import { apiGet } from "@/lib/server-api";

export const TOKEN_COOKIE = "adminToken";
const MAX_AGE_SECONDS = 60 * 60 * 24; // matches the backend's 24h token

export interface AdminUser {
  _id: string;
  name?: string;
  email: string;
  role: string;
}

/**
 * Cookie options for the admin session.
 *
 * httpOnly is the point of the whole exercise: the Vite app stored the token
 * via document.cookie, so any injected script could read it. Here JavaScript
 * cannot touch it - only the Next server attaches it to API calls.
 */
export const sessionCookie = {
  name: TOKEN_COOKIE,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};

/**
 * Verifies the session against Express, which remains the sole authority on
 * whether a token is valid and what role it carries. Returns null when there
 * is no cookie or the backend rejects it.
 */
export async function getCurrentUser(): Promise<AdminUser | null> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) return null;

  // Never cached: a revoked or expired token must stop working immediately.
  return apiGet<AdminUser>("/auth/me", { token, revalidate: 0 });
}
