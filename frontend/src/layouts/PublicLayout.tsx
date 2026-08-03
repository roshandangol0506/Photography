import { Outlet, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeProvider";
import { useTheme } from "@/hooks/useTheme";
import { Navbar } from "@/components/public/Navbar";
import { MaintenancePage } from "@/components/public/MaintenancePage";
import { VisitorTracker } from "@/components/public/VisitorTracker";
import { WhatsAppWidget } from "@/components/public/WhatsAppWidget";

function PublicLayoutContent() {
  const { settings } = useTheme();
  const { pathname } = useLocation();

  if (settings.maintenanceMode) {
    return <MaintenancePage />;
  }

  // Home ships its own fixed nav (transparent over the full-bleed hero) and
  // owns the viewport from the very top, so the shared chrome steps aside.
  const isHome = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <VisitorTracker />
      {!isHome && <Navbar />}
      <main className={isHome ? "flex-1" : "flex-1 pt-24"}>
        <Outlet />
      </main>
      <WhatsAppWidget />
    </div>
  );
}

export function PublicLayout() {
  return (
    <ThemeProvider>
      <PublicLayoutContent />
    </ThemeProvider>
  );
}
