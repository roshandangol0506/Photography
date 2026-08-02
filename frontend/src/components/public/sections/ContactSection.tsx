import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateMessage } from "@/api/messages";
import { useTheme } from "@/hooks/useTheme";
import { MdReveal } from "@/components/public/MdReveal";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  message: z.string().min(1, "Message is required"),
});

type ContactForm = z.infer<typeof contactSchema>;

const FIELD_CLASS =
  "border-0 border-b-2 bg-transparent px-0 py-2.5 font-[inherit] text-[15px] text-md-poster outline-none";
const FIELD_BORDER = { borderBottomColor: "rgba(255,242,239,.5)" };
const LABEL_CLASS =
  "text-[10px] tracking-[0.2em] uppercase opacity-85";

// Settings store a full profile URL; the poster shows the handle.
function instagramHandle(url?: string) {
  if (!url) return "";
  const segment = url.replace(/\/+$/, "").split("/").pop() ?? "";
  if (!segment) return "";
  return segment.startsWith("@") ? segment : `@${segment}`;
}

export function ContactSection() {
  const { settings } = useTheme();
  const createMessage = useCreateMessage();
  const form = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (values: ContactForm) => {
    try {
      await createMessage.mutateAsync(values);
      toast.success("Your message has been sent. We'll get back to you soon.");
      form.reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const details = [
    { label: "Email", value: settings.contactDetails?.email },
    { label: "Studio", value: settings.contactDetails?.location },
    {
      label: "Instagram",
      value: instagramHandle(settings.socialLinks?.instagram),
    },
  ].filter((detail) => Boolean(detail.value));

  const errors = form.formState.errors;

  return (
    <section
      id="contact"
      className="mt-[100px] bg-md-red px-9 py-24 text-md-poster"
    >
      <div className="grid grid-cols-[1.1fr_0.9fr] items-start gap-[72px] max-[900px]:grid-cols-1">
        <div>
          <span className="text-[11px] tracking-[0.2em] uppercase opacity-85">
            08 &mdash; Contact
          </span>
          <MdReveal>
            <h2 className="mt-[18px] font-extrabold tracking-[-0.03em] text-[clamp(34px,5.4vw,84px)] leading-[0.94]">
              <span className="block">Let's make</span>
              <span className="block">something</span>
              <span className="block">worth keeping.</span>
            </h2>
          </MdReveal>

          {details.length > 0 && (
            <div
              className="mt-[52px] flex flex-wrap gap-11 border-t-2 pt-[22px]"
              style={{ borderTopColor: "rgba(255,242,239,.45)" }}
            >
              {details.map((detail) => (
                <div key={detail.label}>
                  <p className="m-0 text-[10px] tracking-[0.2em] uppercase opacity-80">
                    {detail.label}
                  </p>
                  <p className="mt-1.5 mb-0 text-[15px] font-semibold">
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <MdReveal>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-[22px]"
          >
            <label className="flex flex-col gap-2">
              <span className={LABEL_CLASS}>Name</span>
              <input
                type="text"
                className={FIELD_CLASS}
                style={FIELD_BORDER}
                {...form.register("name")}
              />
              {errors.name && (
                <span className="text-[11px] opacity-85">
                  {errors.name.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className={LABEL_CLASS}>Email</span>
              <input
                type="email"
                className={FIELD_CLASS}
                style={FIELD_BORDER}
                {...form.register("email")}
              />
              {errors.email && (
                <span className="text-[11px] opacity-85">
                  {errors.email.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className={LABEL_CLASS}>What are we making?</span>
              <textarea
                rows={3}
                className={`${FIELD_CLASS} resize-y`}
                style={FIELD_BORDER}
                {...form.register("message")}
              />
              {errors.message && (
                <span className="text-[11px] opacity-85">
                  {errors.message.message}
                </span>
              )}
            </label>

            <button
              type="submit"
              disabled={createMessage.isPending}
              className="cursor-pointer self-start border-0 bg-md-ink px-6 py-[17px] font-[inherit] text-[12px] font-semibold tracking-[0.18em] text-md-poster uppercase transition-colors duration-200 hover:bg-md-poster hover:text-md-red"
            >
              {createMessage.isPending ? "Sending…" : "Send enquiry"}
            </button>
          </form>
        </MdReveal>
      </div>
    </section>
  );
}
