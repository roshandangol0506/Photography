import { Outlet, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeProvider";
import { useTheme } from "@/hooks/useTheme";
import { HomeNavbar } from "@/components/public/HomeNavbar";
import { MaintenancePage } from "@/components/public/MaintenancePage";
import { VisitorTracker } from "@/components/public/VisitorTracker";
import { WhatsAppWidget } from "@/components/public/WhatsAppWidget";
import { Footer } from "@/components/public/Footer";

function PublicLayoutContent() {
  const { settings } = useTheme();
  const { pathname } = useLocation();

  if (settings.maintenanceMode) {
    return <MaintenancePage />;
  }

  // The bar is fixed, so only home - whose hero sits underneath it - skips
  // the top padding that keeps content clear of it.
  const isHome = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <VisitorTracker />
      <HomeNavbar overHero={isHome} />
      <main className={isHome ? "flex-1" : "flex-1 pt-24"}>
        <Outlet />
      </main>
      <WhatsAppWidget />
      <Footer />
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
