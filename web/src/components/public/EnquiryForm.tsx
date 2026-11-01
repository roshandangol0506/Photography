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

// Styled for the ink Projects location panel: hairline underlines that
// brighten on focus, small tracked labels in the muted grey, and text in
// the same warm light as the rest of the section.
const LABEL_CLASS =
  "text-label font-medium text-md-600 uppercase transition-colors duration-300 group-focus-within:text-md-light";
const FIELD_CLASS = [
  "w-full border-0 border-b border-md-light/20 bg-transparent px-0 py-2",
  "text-body text-md-light outline-none",
  "transition-colors duration-300 focus:border-md-light",
  // Keep browser autofill from painting the field white or yellow.
  "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_var(--color-md-ink)] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--color-md-light)]",
].join(" ");
const ERROR_CLASS =
  "text-caption text-[#e0796b]";

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

      {/* A hairline outline that fills with light on hover, the arrow
          nudging forward. */}
      <button
        type="submit"
        disabled={createMessage.isPending}
        className="group/button mt-2 flex w-full cursor-pointer items-center justify-between border border-md-light/60 bg-transparent px-5 py-4 text-label font-medium text-md-light uppercase transition-colors duration-300 hover:border-md-red-deep hover:bg-md-red-deep hover:text-md-light disabled:cursor-wait disabled:opacity-60"
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
