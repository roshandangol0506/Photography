"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "@/lib/client-api";
import type { AdminUser } from "@/lib/auth";

export interface LoginResult {
  otpRequired: boolean;
  email?: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

/**
 * Admin session state for the UI.
 *
 * There is no loading state and no bootstrap request: the layout is a Server
 * Component that has already verified the session against Express, so the
 * user arrives as a prop. The three actions below hit Next route handlers
 * (not Express directly) because only the server can set or clear the
 * HttpOnly cookie.
 */
export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: AdminUser | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<AdminUser | null>(initialUser);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.post<LoginResult & { user?: AdminUser }>(
      "/login",
      { email, password },
    );
    if (!data.otpRequired && data.user) setUser(data.user);
    return { otpRequired: data.otpRequired, email: data.email };
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const { data } = await authApi.post<{ user: AdminUser | null }>(
      "/otp/verify",
      { email, otp },
    );
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await authApi.post("/logout").catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
