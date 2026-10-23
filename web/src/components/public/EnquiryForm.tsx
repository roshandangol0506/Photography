"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { useCreateMessage } from "@/lib/api/messages";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  message: z.string().min(1, "Message is required"),
});

type ContactForm = z.infer<typeof contactSchema>;

// Styled for the dark Projects location panel: hairline underlines that
// brighten on focus, small tracked labels in the panel's grey, and text in
// the same soft white as the rest of the section.
const LABEL_CLASS =
  "font-(family-name:--font-archivo) text-[10px] leading-none font-medium tracking-[0.18em] text-[#767676] uppercase transition-colors duration-300 group-focus-within:text-[#f5f5f5]";
const FIELD_CLASS = [
  "w-full border-0 border-b border-white/20 bg-transparent px-0 py-2",
  "font-(family-name:--font-archivo) text-[15px] text-[#f5f5f5] outline-none",
  "transition-colors duration-300 focus:border-[#f5f5f5]",
  // Keep browser autofill from painting the field white or yellow.
  "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#191919] [&:-webkit-autofill]:[-webkit-text-fill-color:#f5f5f5]",
].join(" ");
const ERROR_CLASS =
  "font-(family-name:--font-archivo) text-[11px] leading-none text-[#e0796b]";

/** Name, email and message, sent to the studio's inbox. */
export function EnquiryForm({
  rows = 2,
  className = "",
}: {
  rows?: number;
  className?: string;
}) {
  const createMessage = useCreateMessage();
  const form = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });
  const errors = form.formState.errors;

  const onSubmit = async (values: ContactForm) => {
    try {
      await createMessage.mutateAsync(values);
      toast.success("Your message has been sent. We'll get back to you soon.");
      form.reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className={`flex flex-col gap-5 ${className}`}
    >
      <label className="group flex flex-col gap-2">
        <span className={LABEL_CLASS}>Name</span>
        <input
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          className={FIELD_CLASS}
          {...form.register("name")}
        />
        {errors.name && <span className={ERROR_CLASS}>{errors.name.message}</span>}
      </label>

      <label className="group flex flex-col gap-2">
        <span className={LABEL_CLASS}>Email</span>
        <input
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          className={FIELD_CLASS}
          {...form.register("email")}
        />
        {errors.email && <span className={ERROR_CLASS}>{errors.email.message}</span>}
      </label>

      <label className="group flex flex-col gap-2">
        <span className={LABEL_CLASS}>What are we making?</span>
        <textarea
          rows={rows}
          aria-invalid={Boolean(errors.message)}
          className={`${FIELD_CLASS} resize-none`}
          {...form.register("message")}
        />
        {errors.message && (
          <span className={ERROR_CLASS}>{errors.message.message}</span>
        )}
      </label>

      {/* A hairline outline that fills with white on hover, the arrow
          nudging forward. */}
      <button
        type="submit"
        disabled={createMessage.isPending}
        className="group/button mt-2 flex w-full cursor-pointer items-center justify-between border border-[#f5f5f5]/60 bg-transparent px-5 py-4 font-(family-name:--font-archivo) text-[11px] font-medium tracking-[0.22em] text-[#f5f5f5] uppercase transition-colors duration-300 hover:border-[#f5f5f5] hover:bg-[#f5f5f5] hover:text-[#191919] disabled:cursor-wait disabled:opacity-60"
      >
        {createMessage.isPending ? "Sending…" : "Send enquiry"}
        <ArrowRight
          aria-hidden="true"
          strokeWidth={1.25}
          className="size-4 transition-transform duration-300 group-hover/button:translate-x-1"
        />
      </button>
    </form>
  );
}
