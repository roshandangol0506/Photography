"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthProvider, useAuth } from "@/components/providers/AuthProvider";

function Form() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, verifyOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStage, setOtpStage] = useState(false);
  const [pending, setPending] = useState(false);

  // Middleware records where the visitor was headed before the redirect.
  const destination = searchParams.get("from") || "/admin";
  const forbidden = searchParams.get("error") === "forbidden";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      if (otpStage) {
        await verifyOtp(email, otp);
      } else {
        const result = await login(email, password);
        if (result.otpRequired) {
          setOtpStage(true);
          toast.success("Enter the code we just sent you.");
          return;
        }
      }
      // A full navigation, not a client push: the layout must re-run on the
      // server so it can read the freshly set cookie.
      window.location.href = destination;
    } catch {
      toast.error(
        otpStage ? "That code was not accepted." : "Invalid email or password.",
      );
    } finally {
      setPending(false);
    }
  };

  const field =
    "w-full border-2 border-md-divider bg-transparent px-4 py-3 font-[inherit] text-[14px] text-md-fg outline-none focus:border-md-red";

  return (
    <div className="modernist flex min-h-screen items-center justify-center bg-md-ground px-5 text-md-fg">
      <form onSubmit={submit} className="w-full max-w-[380px]">
        <span className="text-[11px] tracking-[0.2em] text-md-red uppercase">
          Dashboard
        </span>
        <h1 className="mt-[14px] mb-8 font-bold tracking-[-0.025em] text-[clamp(28px,4vw,44px)] leading-none">
          {otpStage ? "Enter your code" : "Sign in"}
        </h1>

        {forbidden && (
          <p className="mb-6 border-2 border-md-red px-4 py-3 text-[13px] text-md-red">
            That account does not have dashboard access.
          </p>
        )}

        {otpStage ? (
          <label className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[0.2em] text-md-600 uppercase">
              One-time code
            </span>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              autoComplete="one-time-code"
              required
              className={field}
            />
          </label>
        ) : (
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] tracking-[0.2em] text-md-600 uppercase">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
                className={field}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] tracking-[0.2em] text-md-600 uppercase">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className={field}
              />
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-8 w-full cursor-pointer border-0 bg-md-ink px-6 py-4 text-[12px] font-semibold tracking-[0.16em] text-md-light uppercase transition-colors duration-200 hover:bg-md-red disabled:opacity-60"
        >
          {pending ? "Please wait…" : otpStage ? "Verify" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

/**
 * Login carries its own provider: it sits outside the dashboard layout, which
 * is where the authenticated provider normally comes from.
 */
export function LoginForm() {
  return (
    <AuthProvider initialUser={null}>
      <Form />
    </AuthProvider>
  );
}
