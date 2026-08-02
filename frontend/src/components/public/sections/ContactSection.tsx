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
const LABEL_CLASS = "text-[10px] tracking-[0.2em] uppercase opacity-85";

// Settings store a full profile URL; the poster shows the handle. Parsing the
// pathname rather than splitting the raw string keeps query strings and
// fragments (which Facebook share links carry) out of the label.
function socialHandle(url: string | undefined, prefix: boolean) {
  if (!url) return "";
  try {
    const segment = new URL(url).pathname.split("/").filter(Boolean).pop();
    if (!segment) return "";
    return prefix ? `@${segment.replace(/^@/, "")}` : segment;
  } catch {
    return url;
  }
}

/**
 * The map field accepts either a bare embed URL or the whole <iframe> snippet
 * Google hands you. Pull the src out of the markup rather than injecting the
 * HTML, and only trust an http(s) target.
 */
function mapSrc(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  const embedded = trimmed.match(/src=["']([^"']+)["']/i);
  const src = embedded ? embedded[1] : trimmed;
  return /^https?:\/\//i.test(src) ? src : "";
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

  const { contactDetails, socialLinks } = settings;
  const email = contactDetails?.email;
  const phone = contactDetails?.phone;

  const details = [
    {
      label: "Email",
      value: email,
      href: email ? `mailto:${email}` : undefined,
      external: false,
    },
    {
      label: "Phone",
      value: phone,
      // Strip spaces and separators so the dialler gets a clean number.
      href: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined,
      external: false,
    },
    {
      label: "Studio",
      value: contactDetails?.location,
      href: undefined,
      external: false,
    },
    {
      label: "Instagram",
      value: socialHandle(socialLinks?.instagram, true),
      href: socialLinks?.instagram,
      external: true,
    },
    {
      label: "Facebook",
      value: socialHandle(socialLinks?.facebook, false),
      href: socialLinks?.facebook,
      external: true,
    },
  ].filter((detail) => Boolean(detail.value));

  const map = mapSrc(contactDetails?.mapEmbedUrl);
  const errors = form.formState.errors;

  return (
    <section
      id="contact"
      className="mt-[100px] bg-md-red px-9 py-24 text-md-poster"
    >
      <div className="grid grid-cols-[1.1fr_0.9fr] items-center gap-[72px] max-[900px]:grid-cols-1">
        <div>
          <span className="text-[11px] tracking-[0.2em] uppercase opacity-85">
            08 &mdash; Contact
          </span>
          <MdReveal>
            <h2 className="mt-[18px] font-extrabold tracking-[-0.03em] text-[clamp(34px,5.4vw,84px)] leading-[0.94]">
              <span className="block">Let's make something</span>
              <span className="block">worth keeping.</span>
            </h2>
          </MdReveal>

          {map && (
            <div
              className="mt-10 w-full max-w-[900px] border-2"
              style={{ borderColor: "rgba(255,242,239,.45)" }}
            >
              <iframe
                src={map}
                title="Studio location"
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="block h-[clamp(220px,45vw,400px)] w-full border-0"
              />
            </div>
          )}
        </div>

        <MdReveal>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col justify-end gap-[22px]"
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
      {details.length > 0 && (
        <div
          className="mt-10 flex flex-wrap justify-around gap-11 border-t-2 pt-[22px]"
          style={{ borderTopColor: "rgba(255,242,239,.45)" }}
        >
          {details.map((detail) => (
            <div key={detail.label}>
              <p className="m-0 text-[10px] tracking-[0.2em] uppercase opacity-80">
                {detail.label}
              </p>
              {detail.href ? (
                <a
                  href={detail.href}
                  {...(detail.external
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                  className="mt-1.5 inline-block text-[15px] font-semibold text-md-poster underline-offset-4 transition-opacity duration-200 hover:underline hover:opacity-80"
                >
                  {detail.value}
                </a>
              ) : (
                <p className="mt-1.5 mb-0 text-[15px] font-semibold">
                  {detail.value}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
