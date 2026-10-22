"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import type { ActiveCategory } from "@/types/content";
import { useCreateLead } from "@/lib/api/leads";
import { MdReveal } from "@/components/public/MdReveal";
import { Accordion, type AccordionItem } from "@/components/ui/Accordion";

const SECTION_CLASS = "px-9 max-[900px]:px-5";
const KICKER_CLASS = "text-[11px] tracking-[0.2em] text-md-red uppercase";
const H2_CLASS =
  "mt-[14px] mb-0 font-bold tracking-[-0.025em] text-[clamp(28px,3.6vw,54px)] leading-none";
const FIELD_CLASS =
  "w-full border-2 border-md-divider bg-transparent px-4 py-3 font-[inherit] text-[14px] text-md-fg outline-none focus:border-md-red";
const LABEL_CLASS = "text-[10px] tracking-[0.2em] text-md-600 uppercase";

const STEPS = [
  {
    title: "You write",
    body: "Tell me what you have in mind — a date, a place, a rough idea is plenty to start with.",
  },
  {
    title: "I reply within two days",
    body: "Usually the same day. You will get availability, a clear price, and any questions I have.",
  },
  {
    title: "We shoot",
    body: "Files are delivered within two weeks, edited and ready to publish or print.",
  },
];

const FAQ: AccordionItem[] = [
  {
    question: "How do I book a photography session with you?",
    answer:
      "To book a photography session with me, simply visit my website and click on the “Book Now” button. From there, you can select the type of session you’re interested in and choose a date and time that works for you or can directly send me an email/whatsapp messages.",
  },
  {
    question: "What types of photography sessions do you offer?",
    answer:
      "I offer a variety of photography sessions, including portrait sessions, engagement sessions, family sessions, corporate events, field assignments and more.",
  },
  {
    question: "How much do your photography sessions cost?",
    answer:
      "The cost of my photography sessions varies depending on the nature of assignment and the amount of time you need.",
  },
  {
    question: "What is included in your photography sessions?",
    answer:
      "My photography sessions include a set amount of time, a certain number of high resolution digital images, and editing and retouching of the selected images.",
  },
  {
    question: "How long will it take to receive my photos?",
    answer:
      "The turnaround time for receiving your photos will depend on the type of session and the number of images. Typically, you can expect to receive your edited images within one week after your session. On top of that depending upon the situation I can also provide some urgent photos on the same day of the shoot.",
  },
];

const bookingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Contact number is required"),
  email: z.string().email("Enter a valid email address"),
  bookingDate: z.string().min(1, "Pick a date and time"),
  category: z.string().optional(),
  description: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

function CategoryCard({
  category,
  onBook,
}: {
  category: ActiveCategory;
  onBook: () => void;
}) {
  return (
    <MdReveal className="h-full">
      <div className="flex h-full flex-col items-center rounded-2xl border-2 border-md-divider bg-md-100 p-7 text-center">
        <div className="relative h-32 w-32 flex-none overflow-hidden rounded-3xl">
          {category.coverImage ? (
            <Image
              quality={90}
              src={category.coverImage}
              alt={category.name}
              fill
              sizes="128px"
              className="object-cover select-none"
              draggable={false}
            />
          ) : (
            <div className="h-full w-full bg-md-300" aria-hidden="true" />
          )}
        </div>

        <h3 className="mt-6 mb-0 text-[20px] font-bold tracking-[-0.02em]">
          {category.name}
        </h3>

        {/* Two lines then an ellipsis, whatever the real length. */}
        <p className="mt-2 mb-0 line-clamp-2 text-[13px] leading-[1.6] text-md-600">
          {category.description || `${category.photoCount} photographs`}
        </p>

        {/* Flush to the card's right edge; the arrow is part of the label. */}
        <Link
          href={`/gallery?category=${category.slug}`}
          className="mt-6 inline-flex items-center gap-2 self-end text-[12px] font-semibold tracking-[0.14em] underline-offset-4 transition-colors duration-200 hover:text-md-red! hover:underline!"
        >
          View more <span aria-hidden="true">&rarr;</span>
        </Link>

        <button
          type="button"
          onClick={onBook}
          className="mt-3 w-full cursor-pointer rounded-full border-0 bg-md-red px-5 py-2.5 text-[12px] font-semibold tracking-[0.14em] text-md-light uppercase transition-opacity duration-200 hover:opacity-90"
        >
          Book a demo
        </button>
      </div>
    </MdReveal>
  );
}

export function ContactPageContent({
  categories,
}: {
  categories: ActiveCategory[];
}) {
  const createLead = useCreateLead();
  const bookingRef = useRef<HTMLDivElement>(null);
  const [selectedName, setSelectedName] = useState("");

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { category: "" },
  });

  const series = categories;
  const errors = form.formState.errors;

  const bookCategory = (category: ActiveCategory) => {
    form.setValue("category", category._id);
    setSelectedName(category.name);
    bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (values: BookingForm) => {
    try {
      await createLead.mutateAsync({
        fullName: `${values.firstName.trim()} ${values.lastName.trim()}`,
        email: values.email,
        phone: values.phone,
        description: values.description,
        bookingDate: new Date(values.bookingDate).toISOString(),
        category: values.category || undefined,
      });
      toast.success("Thanks — your booking request has been sent.");
      form.reset({ category: "" });
      setSelectedName("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="modernist text-md-fg">
      <section className="relative flex h-screen min-h-[620px] items-center justify-center overflow-hidden px-9 max-[900px]:px-5">
        <Image
          quality={90}
          src="/bookADemo.jpg"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover select-none"
          draggable={false}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "rgba(20,19,18,.45)" }}
        />
        <h1 className="relative m-0 max-w-[16em] text-center font-extrabold tracking-[-0.03em] text-[clamp(34px,5.4vw,84px)] leading-[0.94] text-md-light">
          Let's make something worth keeping.
        </h1>
      </section>

      {series.length > 0 && (
        <section className={`${SECTION_CLASS} pt-[70px] pb-[70px]`}>
          <span className={KICKER_CLASS}>What I shoot</span>
          <h2 className={H2_CLASS}>Choose a series.</h2>

          <div className="mt-12 grid grid-cols-4 gap-8 max-[1200px]:grid-cols-3 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
            {series.map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
                onBook={() => bookCategory(category)}
              />
            ))}
          </div>
        </section>
      )}

      <section
        ref={bookingRef}
        id="book-a-demo"
        className={`${SECTION_CLASS} scroll-mt-28 pt-[70px] pb-[70px]`}
      >
        <div className="grid grid-cols-2 items-start gap-16 max-[1000px]:grid-cols-1 max-[1000px]:gap-10">
          <div>
            <span className={KICKER_CLASS}>Book a demo</span>
            <h2 className={H2_CLASS}>Reserve a slot.</h2>
            <p className="mt-8 mb-0 max-w-[460px] text-[15px] leading-[1.75] text-md-700">
              Pick the kind of work you have in mind, or book a slot straight
              away. Commissions, prints and workshop bookings all reach the same
              inbox — and it is always me who answers.
            </p>
            {selectedName && (
              <p className="mt-6 mb-0 text-[13px] text-md-700">
                Booking for{" "}
                <span className="font-semibold">{selectedName}</span>
              </p>
            )}
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-6 max-[700px]:grid-cols-1"
          >
            <label className="flex flex-col gap-2">
              <span className={LABEL_CLASS}>First name</span>
              <input
                type="text"
                className={FIELD_CLASS}
                {...form.register("firstName")}
              />
              {errors.firstName && (
                <span className="text-[11px] text-md-red">
                  {errors.firstName.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className={LABEL_CLASS}>Last name</span>
              <input
                type="text"
                className={FIELD_CLASS}
                {...form.register("lastName")}
              />
              {errors.lastName && (
                <span className="text-[11px] text-md-red">
                  {errors.lastName.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className={LABEL_CLASS}>Contact number</span>
              <input
                type="tel"
                className={FIELD_CLASS}
                {...form.register("phone")}
              />
              {errors.phone && (
                <span className="text-[11px] text-md-red">
                  {errors.phone.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className={LABEL_CLASS}>Email</span>
              <input
                type="email"
                placeholder="you@gmail.com"
                className={FIELD_CLASS}
                {...form.register("email")}
              />
              {errors.email && (
                <span className="text-[11px] text-md-red">
                  {errors.email.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className={LABEL_CLASS}>Booking date &amp; time</span>
              <input
                type="datetime-local"
                className={FIELD_CLASS}
                {...form.register("bookingDate")}
              />
              {errors.bookingDate && (
                <span className="text-[11px] text-md-red">
                  {errors.bookingDate.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className={LABEL_CLASS}>Series</span>
              <select
                className={FIELD_CLASS}
                {...form.register("category", {
                  onChange: (event) => {
                    const match = series.find(
                      (item) => item._id === event.target.value,
                    );
                    setSelectedName(match?.name ?? "");
                  },
                })}
              >
                <option value="">No preference</option>
                {series.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="col-span-2 flex flex-col gap-2 max-[700px]:col-span-1">
              <span className={LABEL_CLASS}>Description</span>
              <textarea
                rows={4}
                placeholder="What are we making?"
                className={`${FIELD_CLASS} resize-y`}
                {...form.register("description")}
              />
            </label>

            <button
              type="submit"
              disabled={createLead.isPending}
              className="col-span-2 cursor-pointer justify-self-start border-0 bg-md-ink px-6 py-4 text-[12px] font-semibold tracking-[0.16em] text-md-light uppercase transition-colors duration-200 hover:bg-md-red disabled:opacity-60 max-[700px]:col-span-1"
            >
              {createLead.isPending ? "Sending…" : "Book a demo"}
            </button>
          </form>
        </div>
      </section>

      <section className={`${SECTION_CLASS} pt-[70px] pb-[70px]`}>
        <span className={KICKER_CLASS}>What happens next</span>
        <h2 className={H2_CLASS}>From message to prints.</h2>

        <div className="mt-12 grid grid-cols-3 gap-[52px] max-[900px]:grid-cols-1 max-[900px]:gap-10">
          {STEPS.map((step, i) => (
            <MdReveal key={step.title}>
              <div className="flex items-baseline gap-4 border-t-2 border-md-divider pt-5">
                <span className="text-[clamp(22px,2.4vw,34px)] font-bold tracking-[-0.02em]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="m-0 text-[15px] font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-2 mb-0 text-[14px] leading-[1.7] text-md-700">
                    {step.body}
                  </p>
                </div>
              </div>
            </MdReveal>
          ))}
        </div>

        <p className="mt-12 mb-0 flex items-center gap-2 text-[11px] tracking-[0.16em] text-md-600 uppercase">
          <Clock className="h-4 w-4" /> Replies within two working days
        </p>
      </section>

      <section className={`${SECTION_CLASS} pt-[70px] pb-[90px]`}>
        <div className="grid grid-cols-[0.75fr_1.25fr] items-start gap-16 max-[1000px]:grid-cols-1 max-[1000px]:gap-10">
          <div>
            <span className={KICKER_CLASS}>FAQ</span>
            <h2 className={H2_CLASS}>Questions I get asked.</h2>
          </div>
          <Accordion items={FAQ} />
        </div>
      </section>
    </div>
  );
}
