import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Dashboard",
  // The dashboard must never be indexed, regardless of robots.txt.
  robots: { index: false, follow: false },
};

/**
 * Server-side authorization gate for every dashboard page.
 *
 * This lives in a `(dashboard)` route group rather than at `app/admin/` so it
 * does not wrap `/admin/login` - a gate on the login page would redirect
 * signed-out visitors away from the one page they need. The group changes
 * nesting without changing any URL.
 *
 * Middleware only checks that a cookie exists; this verifies it against
 * Express and reads the real role, so no admin markup or data is ever sent to
 * an unauthenticated browser. The Vite AuthGuard shipped the whole dashboard
 * bundle first and decided afterwards.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/admin/login");

  // Authenticated but not an admin: a valid session is not an entitlement.
  if (user.role !== "ADMIN") redirect("/admin/login?error=forbidden");

  return (
    <QueryProvider>
      <AuthProvider initialUser={user}>
        <AdminShell>{children}</AdminShell>
      </AuthProvider>
    </QueryProvider>
  );
}
