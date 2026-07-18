import { createContext } from "react";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  twoFA: boolean;
}

export interface LoginResult {
  otpRequired: boolean;
  email?: string;
}

export interface AuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
