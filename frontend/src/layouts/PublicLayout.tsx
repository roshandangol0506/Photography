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

  const isHome = pathname === "/";
  const isContact = pathname === "/contact";
  const isAbout = pathname === "/about";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <VisitorTracker />
      <HomeNavbar overHero={isHome || isContact || isAbout} />
      <main
        className={isHome || isContact || isAbout ? "flex-1" : "flex-1 pt-24"}
      >
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
