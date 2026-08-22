import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useSettings,
  useUpdateSettings,
  type SiteSettings,
} from "@/api/settings";
import { useUploadAsset } from "@/api/uploads";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface AppearanceFormValues {
  siteAccent: string;
  siteBackground: string;
  siteText: string;
  autoplaySpeedMs: number;
  transitionStyle: string;
  animationsEnabled: boolean;
  darkModeDefault: boolean;
}

function AppearanceForm({ settings }: { settings: SiteSettings }) {
  const updateMutation = useUpdateSettings();
  const uploadMutation = useUploadAsset();
  const [logo, setLogo] = useState<string | undefined>(settings.logo);
  const [logoDark, setLogoDark] = useState<string | undefined>(
    settings.logoDark,
  );

  const form = useForm<AppearanceFormValues>({
    defaultValues: {
      siteAccent: settings.themeColors?.siteAccent ?? "#ec3013",
      siteBackground: settings.themeColors?.siteBackground ?? "#f3f2f2",
      siteText: settings.themeColors?.siteText ?? "#201e1d",
      autoplaySpeedMs: settings.heroSettings?.autoplaySpeedMs ?? 5000,
      transitionStyle: settings.heroSettings?.transitionStyle ?? "photography",
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

  const handleLogoDarkChange = async (file: File | null) => {
    if (!file) return;
    try {
      const result = await uploadMutation.mutateAsync(file);
      setLogoDark(result.url);
    } catch {
      toast.error("Logo upload failed");
    }
  };

  const onSubmit = async (values: AppearanceFormValues) => {
    try {
      await updateMutation.mutateAsync({
        logo,
        logoDark,
        themeColors: {
          // Dashboard palette is not edited here - carry it through so saving
          // this form never wipes it.
          primary: settings.themeColors?.primary ?? "#c5161d",
          secondary: settings.themeColors?.secondary ?? "#044189",
          accent: settings.themeColors?.accent ?? "#f5a623",
          siteAccent: values.siteAccent,
          siteBackground: values.siteBackground,
          siteText: values.siteText,
        },
        heroSettings: {
          autoplaySpeedMs: Number(values.autoplaySpeedMs),
          transitionStyle: values.transitionStyle,
          eyebrow: settings.heroSettings?.eyebrow ?? "",
          headline: settings.heroSettings?.headline ?? "",
          ctaLabel: settings.heroSettings?.ctaLabel ?? "",
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
        <ImageUploader
          value={logo}
          onChange={handleLogoChange}
          label="Light logo"
        />
        <p className="text-xs text-muted-foreground">
          Used over the hero photograph, on the dark footer, and in the navbar
          while dark mode is on.
        </p>
        <ImageUploader
          value={logoDark}
          onChange={handleLogoDarkChange}
          label="Dark logo"
        />
        <p className="text-xs text-muted-foreground">
          Swapped in when the navbar turns light on scroll. Falls back to the
          light logo if left empty.
        </p>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">
          Website colors
        </h2>
        <p className="text-xs text-muted-foreground">
          Applies to the public site in light mode. Dark mode keeps its own
          palette.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="siteAccent">Accent</Label>
            <Input
              id="siteAccent"
              type="color"
              className="h-10 p-1"
              {...form.register("siteAccent")}
            />
            <p className="text-xs text-muted-foreground">
              Kickers, hover states, hero progress bar.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteBackground">Background</Label>
            <Input
              id="siteBackground"
              type="color"
              className="h-10 p-1"
              {...form.register("siteBackground")}
            />
            <p className="text-xs text-muted-foreground">Page ground.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteText">Text</Label>
            <Input
              id="siteText"
              type="color"
              className="h-10 p-1"
              {...form.register("siteText")}
            />
            <p className="text-xs text-muted-foreground">
              Headings and body copy.
            </p>
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
              <option value="slide">A — Slide (right to left)</option>
              <option value="gradient">B — Gradient / mask reveal</option>
              <option value="futuristic">
                C — Futuristic (blur + scale + sweep)
              </option>
              <option value="photography">
                D — Photography (Ken Burns + crossfade)
              </option>
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
              <Switch
                checked={field.value ?? true}
                onCheckedChange={field.onChange}
              />
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
              <Switch
                checked={field.value ?? true}
                onCheckedChange={field.onChange}
              />
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
