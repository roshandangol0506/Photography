import { cookies } from "next/headers";
import { sessionCookie } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001/api";
const API_KEY = process.env.API_KEY ?? "";

export async function POST(request: Request) {
  const body = await request.text();

  const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
    method: "POST",
    headers: { "content-type": "application/json", apiKey: API_KEY },
    body,
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return Response.json(payload ?? { message: "Verification failed" }, {
      status: response.status,
    });
  }

  const data = payload?.data ?? {};
  if (data.token) {
    (await cookies()).set({ ...sessionCookie, value: data.token });
  }

  return Response.json({ user: data.user ?? null });
}
