import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { useCreateMessage } from "@/api/messages";
import { useTheme } from "@/hooks/useTheme";
import { SectionReveal } from "@/components/public/SectionReveal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1, "Message is required"),
});

type ContactForm = z.infer<typeof contactSchema>;

export function ContactSection() {
  const { settings } = useTheme();
  const createMessage = useCreateMessage();
  const form = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (values: ContactForm) => {
    try {
      await createMessage.mutateAsync(values);
      toast.success(
        "Your message has been sent. We'll get back to you soon.",
      );
      form.reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionReveal className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Get in Touch
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Contact
        </h2>
      </SectionReveal>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <SectionReveal>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 rounded-2xl border border-border bg-card p-6"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name</Label>
                <Input id="contact-name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input id="contact-phone" {...form.register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-subject">Subject</Label>
                <Input id="contact-subject" {...form.register("subject")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                rows={5}
                {...form.register("message")}
              />
              {form.formState.errors.message && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.message.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={createMessage.isPending}
            >
              {createMessage.isPending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </SectionReveal>

        <SectionReveal
          delay={0.15}
          className="min-h-64 overflow-hidden rounded-2xl border border-border"
        >
          {settings.contactDetails?.mapEmbedUrl ? (
            <iframe
              src={settings.contactDetails.mapEmbedUrl}
              title="Location map"
              loading="lazy"
              className="h-full min-h-64 w-full border-0"
            />
          ) : (
            <div className="flex h-full min-h-64 flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
              <MapPin className="h-6 w-6" />
              <p className="text-sm">Map coming soon</p>
            </div>
          )}
        </SectionReveal>
      </div>
    </section>
  );
}
