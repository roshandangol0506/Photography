import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">
        Welcome back, {user?.name}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your dashboard overview, photo stats, and charts will appear here
        starting Phase 4.
      </p>
    </div>
  );
}
