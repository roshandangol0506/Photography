import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/Badge";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div>
          <p className="text-xs text-muted-foreground">Name</p>
          <p className="text-sm font-medium text-card-foreground">
            {user?.name}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="text-sm font-medium text-card-foreground">
            {user?.email}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Role</p>
          <Badge>{user?.role}</Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            Two-factor authentication
          </p>
          <Badge variant={user?.twoFA ? "success" : "muted"}>
            {user?.twoFA ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Profile editing and password change are not available yet.
      </p>
    </div>
  );
}
