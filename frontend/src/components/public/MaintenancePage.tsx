import { Wrench } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function MaintenancePage() {
  const { settings } = useTheme();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Wrench className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-semibold text-foreground">
        {settings.siteTitle} is under maintenance
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        We&apos;re making some improvements behind the scenes. Please check
        back soon.
      </p>
    </div>
  );
}
