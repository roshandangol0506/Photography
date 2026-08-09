import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { useTheme } from "@/hooks/useTheme";
import { MdReveal } from "@/components/public/MdReveal";
import { ContactSection } from "@/components/public/sections/ContactSection";

const SECTION_CLASS = "px-9 max-[900px]:px-5";
const KICKER_CLASS = "text-[11px] tracking-[0.2em] text-md-red uppercase";
const H2_CLASS =
  "mt-[14px] mb-0 font-bold tracking-[-0.025em] text-[clamp(28px,3.6vw,54px)] leading-none";

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

export default function Contact() {
  const { settings } = useTheme();
  useSeo({
    title: "Contact",
    description: `Get in touch with ${settings.siteTitle} for commissions, prints and street photography walks.`,
  });

  return (
    <div className="modernist bg-md-ground text-md-fg">
      <ContactSection />

      <section
        className={`${SECTION_CLASS} border-t-2 border-md-divider pt-[70px] pb-[70px]`}
      >
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
    </div>
  );
}
