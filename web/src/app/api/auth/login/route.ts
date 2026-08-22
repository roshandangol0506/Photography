import { cookies } from "next/headers";
import { sessionCookie } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001/api";
const API_KEY = process.env.API_KEY ?? "";

/**
 * Login is proxied rather than reimplemented: Express still checks the
 * credentials, issues the JWT and decides whether OTP is required. Next's only
 * job is to move the returned token out of JavaScript's reach.
 */
export async function POST(request: Request) {
  const body = await request.text();

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json", apiKey: API_KEY },
    body,
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return Response.json(payload ?? { message: "Login failed" }, {
      status: response.status,
    });
  }

  const data = payload?.data ?? {};

  // OTP pending: no token yet, so nothing to store.
  if (data.otpRequired) {
    return Response.json({ otpRequired: true, email: data.email });
  }

  if (data.token) {
    (await cookies()).set({ ...sessionCookie, value: data.token });
  }

  // The token is deliberately absent from the response body - it lives only
  // in the HttpOnly cookie.
  return Response.json({ otpRequired: false, user: data.user ?? null });
}
