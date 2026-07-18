import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSettings, useUpdateSettings, type SiteSettings } from "@/api/settings";
import { useUploadAsset } from "@/api/uploads";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface AppearanceFormValues {
  primary: string;
  secondary: string;
  accent: string;
  autoplaySpeedMs: number;
  transitionStyle: string;
  animationsEnabled: boolean;
  darkModeDefault: boolean;
}

function AppearanceForm({ settings }: { settings: SiteSettings }) {
  const updateMutation = useUpdateSettings();
  const uploadMutation = useUploadAsset();
  const [logo, setLogo] = useState<string | undefined>(settings.logo);

  const form = useForm<AppearanceFormValues>({
    defaultValues: {
      primary: settings.themeColors?.primary ?? "#c5161d",
      secondary: settings.themeColors?.secondary ?? "#044189",
      accent: settings.themeColors?.accent ?? "#f5a623",
      autoplaySpeedMs: settings.heroSettings?.autoplaySpeedMs ?? 5000,
      transitionStyle: settings.heroSettings?.transitionStyle ?? "fade",
      animationsEnabled: settings.animationsEnabled,
      darkModeDefault: settings.darkModeDefault,
    },
  });

  const handleLogoChange = async (file: File | null) => {
    if (!file) return;
    try {
      const result = await uploadMutation.mutateAsync(file);
      setLogo(result.url);
    } catch {
      toast.error("Logo upload failed");
    }
  };

  const onSubmit = async (values: AppearanceFormValues) => {
    try {
      await updateMutation.mutateAsync({
        logo,
        themeColors: {
          primary: values.primary,
          secondary: values.secondary,
          accent: values.accent,
        },
        heroSettings: {
          autoplaySpeedMs: Number(values.autoplaySpeedMs),
          transitionStyle: values.transitionStyle,
        },
        animationsEnabled: values.animationsEnabled,
        darkModeDefault: values.darkModeDefault,
      });
      toast.success("Appearance saved");
    } catch {
      toast.error("Failed to save appearance");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Logo</h2>
        <ImageUploader value={logo} onChange={handleLogoChange} label="Site logo" />
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Theme colors</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="primary">Primary</Label>
            <Input
              id="primary"
              type="color"
              className="h-10 p-1"
              {...form.register("primary")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondary">Secondary</Label>
            <Input
              id="secondary"
              type="color"
              className="h-10 p-1"
              {...form.register("secondary")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accent">Accent</Label>
            <Input
              id="accent"
              type="color"
              className="h-10 p-1"
              {...form.register("accent")}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">
          Hero slideshow
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="autoplaySpeedMs">Autoplay speed (ms)</Label>
            <Input
              id="autoplaySpeedMs"
              type="number"
              {...form.register("autoplaySpeedMs", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transitionStyle">Transition style</Label>
            <Select id="transitionStyle" {...form.register("transitionStyle")}>
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="zoom">Zoom</option>
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Animations</p>
            <p className="text-xs text-muted-foreground">
              Enable scroll/hover animations site-wide
            </p>
          </div>
          <Controller
            control={form.control}
            name="animationsEnabled"
            render={({ field }) => (
              <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
            )}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Dark mode by default
            </p>
            <p className="text-xs text-muted-foreground">
              Visitors land on the dark theme first
            </p>
          </div>
          <Controller
            control={form.control}
            name="darkModeDefault"
            render={({ field }) => (
              <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
            )}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save appearance"}
        </Button>
      </div>
    </form>
  );
}

export default function Appearance() {
  const { data, isLoading } = useSettings();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Appearance</h1>
      {isLoading || !data ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <AppearanceForm settings={data} />
      )}
    </div>
  );
}
