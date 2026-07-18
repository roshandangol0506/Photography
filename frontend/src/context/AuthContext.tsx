import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api, TOKEN_COOKIE_KEY } from "@/lib/api";
import { cookie } from "@/utils/cookie";
import { AuthContext, type AdminUser, type LoginResult } from "./auth-context";

const persistToken = (token: string) => {
  cookie.setCookie(TOKEN_COOKIE_KEY, token, { hours: 24 });
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(() =>
    Boolean(cookie.getCookie(TOKEN_COOKIE_KEY)),
  );

  useEffect(() => {
    const token = cookie.getCookie(TOKEN_COOKIE_KEY);
    if (!token) return;

    let active = true;

    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (active) setUser(data.data);
      } catch {
        cookie.deleteCookie(TOKEN_COOKIE_KEY);
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.data.otpRequired) {
        return { otpRequired: true, email: data.data.email };
      }
      persistToken(data.data.token);
      setUser(data.data.user);
      return { otpRequired: false };
    },
    [],
  );

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const { data } = await api.post("/auth/otp/verify", { email, otp });
    persistToken(data.data.token);
    setUser(data.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // token may already be invalid/expired - clearing locally is enough
    }
    cookie.deleteCookie(TOKEN_COOKIE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
