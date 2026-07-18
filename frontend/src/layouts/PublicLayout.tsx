import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeProvider";
import { useTheme } from "@/hooks/useTheme";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { MaintenancePage } from "@/components/public/MaintenancePage";
import { VisitorTracker } from "@/components/public/VisitorTracker";

function PublicLayoutContent() {
  const { settings } = useTheme();

  if (settings.maintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <VisitorTracker />
      <Navbar />
      <main className="flex-1 pt-24">
        <Outlet />
      </main>
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
