"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ImagePlus,
  Images,
  FolderKanban,
  Tags,
  Award,
  Users,
  MessageSquare,
  Quote,
  Mail,
  UserCircle,
  Settings,
  BarChart3,
  Palette,
  LogOut,
  X,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/photos/new", label: "Add Photos", icon: ImagePlus },
  { to: "/admin/photos", label: "Photos", icon: Images },
  { to: "/admin/collections", label: "Collections", icon: FolderKanban },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/awards", label: "Awards", icon: Award },
  { to: "/admin/visitors", label: "Visitors", icon: Users },
  { to: "/admin/comments", label: "Comments", icon: MessageSquare },
  { to: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { to: "/admin/messages", label: "Messages", icon: Mail },
  { to: "/admin/leads", label: "Leads", icon: ClipboardList },
  { to: "/admin/profile", label: "Profile", icon: UserCircle },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/appearance", label: "Appearance", icon: Palette },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  return (
    <>
      {open && (
        <button
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <span className="text-lg font-semibold tracking-tight">
            Photography Admin
          </span>
          <button onClick={onClose} className="lg:hidden" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              onClick={onClose}
              // NavLink's isActive callback has no next/link equivalent, so
              // the comparison is explicit. `end` marks routes that must match
              // exactly - /admin would otherwise light up on every child page.
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                (item.end ? pathname === item.to : pathname.startsWith(item.to))
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
