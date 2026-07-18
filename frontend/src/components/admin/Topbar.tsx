import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 hover:bg-accent lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm font-medium">{user?.name}</span>
        <span className="rounded-full bg-accent px-2 py-1 text-xs text-accent-foreground">
          {user?.role}
        </span>
      </div>
    </header>
  );
}
