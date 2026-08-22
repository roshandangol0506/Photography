import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="modernist min-h-screen bg-md-ground px-9 py-16 text-md-fg">
      <span className="text-[11px] tracking-[0.2em] text-md-red uppercase">
        Dashboard
      </span>
      <h1 className="mt-[14px] mb-0 font-bold tracking-[-0.025em] text-[clamp(28px,4vw,44px)] leading-none">
        Signed in as {user?.email}
      </h1>
      <p className="mt-6 mb-0 text-[14px] text-md-700">
        Role: {user?.role}. Verified server-side against Express before this
        page rendered.
      </p>
    </div>
  );
}
