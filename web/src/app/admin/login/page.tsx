import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    // The form reads `?from=` and `?error=` via useSearchParams, which opts
    // that subtree out of prerendering unless it sits behind a boundary.
    <Suspense
      fallback={<div className="modernist min-h-screen bg-md-ground" />}
    >
      <LoginForm />
    </Suspense>
  );
}
