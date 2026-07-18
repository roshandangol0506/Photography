import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSettings, useUpdateSettings, type SiteSettings } from "@/api/settings";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";

interface SettingsFormValues {
  siteTitle: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  instagram: string;
  facebook: string;
  youtube: string;
  behance: string;
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  mapEmbedUrl: string;
  footerText: string;
  maintenanceMode: boolean;
}

function SettingsForm({ settings }: { settings: SiteSettings }) {
  const updateMutation = useUpdateSettings();

  const form = useForm<SettingsFormValues>({
    defaultValues: {
      siteTitle: settings.siteTitle,
      tagline: settings.tagline ?? "",
      metaTitle: settings.seo?.metaTitle ?? "",
      metaDescription: settings.seo?.metaDescription ?? "",
      instagram: settings.socialLinks?.instagram ?? "",
      facebook: settings.socialLinks?.facebook ?? "",
      youtube: settings.socialLinks?.youtube ?? "",
      behance: settings.socialLinks?.behance ?? "",
      contactEmail: settings.contactDetails?.email ?? "",
      contactPhone: settings.contactDetails?.phone ?? "",
      contactLocation: settings.contactDetails?.location ?? "",
      mapEmbedUrl: settings.contactDetails?.mapEmbedUrl ?? "",
      footerText: settings.footerText ?? "",
      maintenanceMode: settings.maintenanceMode,
    },
  });

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      await updateMutation.mutateAsync({
        siteTitle: values.siteTitle,
        tagline: values.tagline,
        seo: {
          metaTitle: values.metaTitle,
          metaDescription: values.metaDescription,
          ogImage: settings.seo?.ogImage ?? "",
        },
        socialLinks: {
          instagram: values.instagram,
          facebook: values.facebook,
          youtube: values.youtube,
          behance: values.behance,
        },
        contactDetails: {
          email: values.contactEmail,
          phone: values.contactPhone,
          location: values.contactLocation,
          mapEmbedUrl: values.mapEmbedUrl,
        },
        footerText: values.footerText,
        maintenanceMode: values.maintenanceMode,
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">General</h2>
        <div className="space-y-2">
          <Label htmlFor="siteTitle">Site title</Label>
          <Input id="siteTitle" {...form.register("siteTitle")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" {...form.register("tagline")} />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">SEO</h2>
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta title</Label>
          <Input id="metaTitle" {...form.register("metaTitle")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta description</Label>
          <Textarea id="metaDescription" {...form.register("metaDescription")} />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">
          Social links
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" {...form.register("instagram")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" {...form.register("facebook")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube</Label>
            <Input id="youtube" {...form.register("youtube")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="behance">Behance</Label>
            <Input id="behance" {...form.register("behance")} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Contact</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input id="contactEmail" {...form.register("contactEmail")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone</Label>
            <Input id="contactPhone" {...form.register("contactPhone")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="contactLocation">Location</Label>
            <Input id="contactLocation" {...form.register("contactLocation")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="mapEmbedUrl">Map embed URL</Label>
            <Input id="mapEmbedUrl" {...form.register("mapEmbedUrl")} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Footer</h2>
        <div className="space-y-2">
          <Label htmlFor="footerText">Footer text</Label>
          <Textarea id="footerText" {...form.register("footerText")} />
        </div>
      </section>

      <section className="flex items-center justify-between rounded-xl border border-border p-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Maintenance mode
          </p>
          <p className="text-xs text-muted-foreground">
            Temporarily show a maintenance page to visitors
          </p>
        </div>
        <Controller
          control={form.control}
          name="maintenanceMode"
          render={({ field }) => (
            <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
          )}
        />
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </form>
  );
}

export default function Settings() {
  const { data, isLoading } = useSettings();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
      {isLoading || !data ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <SettingsForm settings={data} />
      )}
    </div>
  );
}
