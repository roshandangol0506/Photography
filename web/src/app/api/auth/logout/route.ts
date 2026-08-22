import { cookies } from "next/headers";
import { sessionCookie, TOKEN_COOKIE } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001/api";
const API_KEY = process.env.API_KEY ?? "";

export async function POST() {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;

  // Best effort: the local cookie is cleared either way, so a backend that
  // rejects an already-expired token still results in a logged-out browser.
  if (token) {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { apiKey: API_KEY, authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => {});
  }

  store.set({ ...sessionCookie, value: "", maxAge: 0 });
  return Response.json({ success: true });
}
