import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";

const BRAND = "#25D366";
const HEADER = "#0B7A67";
const CHAT_BG = "#ECE5DD";
const OUTGOING = "#DCF8C6";

const PREFILL = "Hello I visited your website and need more information.";
const INCOMING = ["Hi there 👋", "How can I help you?"];

const GREETING_DELAY_MS = 2000;
const GREETING_VISIBLE_MS = 10000;

// Dismissal is per browser session: a refresh brings the greeting back, but
// closing it keeps it away until the tab is closed.
const DISMISSED_KEY = "wa-greeting-dismissed";

// A faint version of WhatsApp's doodled chat wallpaper, drawn in CSS so the
// widget stays self-contained.
const CHAT_SURFACE = {
  backgroundColor: CHAT_BG,
  backgroundImage: "radial-gradient(rgba(11,122,103,.07) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
};

function currentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function WhatsAppWidget() {
  const { settings } = useTheme();
  const [greetingOpen, setGreetingOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState("");

  const number = settings.contactDetails?.whatsapp?.replace(/\D/g, "") ?? "";

  useEffect(() => {
    if (!number) return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    const show = window.setTimeout(
      () => setGreetingOpen(true),
      GREETING_DELAY_MS,
    );
    const hide = window.setTimeout(
      () => setGreetingOpen(false),
      GREETING_DELAY_MS + GREETING_VISIBLE_MS,
    );

    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [number]);

  useEffect(() => {
    if (!panelOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanelOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panelOpen]);

  // No number configured in the dashboard means no widget at all.
  if (!number) return null;

  const href = `https://wa.me/${number}?text=${encodeURIComponent(PREFILL)}`;
  const name = settings.siteTitle || "Ajay Maharjan";
  const avatar =
    settings.about?.portraitImage || settings.about?.image || settings.logo;

  const dismissGreeting = () => {
    setGreetingOpen(false);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  };

  const openPanel = () => {
    setGreetingOpen(false);
    setOpenedAt(currentTime());
    setPanelOpen(true);
  };

  return (
    <div className="modernist fixed right-6 bottom-6 z-[100] flex flex-col items-end gap-3 max-[640px]:right-[18px] max-[640px]:bottom-[18px]">
      {panelOpen && (
        <div
          role="dialog"
          aria-label={`Chat with ${name} on WhatsApp`}
          className="wa-bubble w-[min(340px,calc(100vw-36px))] overflow-hidden rounded-2xl bg-white shadow-[0_18px_48px_rgba(32,30,29,.26)]"
        >
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{ backgroundColor: HEADER }}
          >
            <span className="relative flex-none">
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25 text-[15px] font-semibold text-white">
                  {name.slice(0, 1)}
                </span>
              )}
              <span
                aria-hidden="true"
                className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-[#0B7A67]"
                style={{ backgroundColor: BRAND }}
              />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold text-white">
                {name}
              </span>
              <span className="block text-[12px] text-white/75">Online</span>
            </span>

            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              aria-label="Close chat"
              className="flex-none cursor-pointer border-0 bg-transparent p-1 text-white/75 transition-colors duration-200 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 py-5" style={CHAT_SURFACE}>
            <p className="m-0 text-center text-[11px] text-[#8a8a8a]">
              {openedAt}
            </p>

            <div className="mt-4 flex flex-col items-start gap-1">
              {INCOMING.map((line, i) => (
                <p
                  key={line}
                  className={`m-0 max-w-[80%] bg-white px-3.5 py-2.5 text-[14px] leading-[1.45] text-[#201e1d] shadow-[0_1px_1px_rgba(32,30,29,.12)] ${
                    i === 0
                      ? "rounded-t-lg rounded-br-lg rounded-bl-sm"
                      : "rounded-b-lg rounded-tr-lg rounded-tl-sm"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Preview of the message the button will send. */}
            <div className="mt-3 flex justify-end">
              <p
                className="m-0 max-w-[85%] rounded-t-lg rounded-br-sm rounded-bl-lg px-3.5 py-2.5 text-[14px] leading-[1.45] text-[#201e1d] shadow-[0_1px_1px_rgba(32,30,29,.12)]"
                style={{ backgroundColor: OUTGOING }}
              >
                {PREFILL}
              </p>
            </div>

            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              onClick={() => setPanelOpen(false)}
              className="mt-6 flex items-center justify-center gap-2.5 rounded-full px-5 py-3.5 text-[15px] font-semibold text-white transition-transform duration-200 hover:scale-[1.02]"
              style={{ backgroundColor: BRAND }}
            >
              <WhatsAppIcon className="h-5 w-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      {greetingOpen && !panelOpen && (
        <div className="wa-bubble relative w-60 rounded-2xl bg-white px-4 py-3.5 shadow-[0_12px_32px_rgba(32,30,29,.18)]">
          {/* Sits above the overlay button so closing never opens the panel. */}
          <button
            type="button"
            onClick={dismissGreeting}
            aria-label="Close greeting"
            className="absolute top-2 right-2 z-10 cursor-pointer rounded-full border-0 bg-transparent p-1 text-[#9b9797] transition-colors duration-200 hover:text-[#201e1d]"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <p className="m-0 pr-5 text-[14px] leading-[1.5] text-[#201e1d]">
            Namaste, How can I help you?
          </p>

          <button
            type="button"
            onClick={openPanel}
            aria-label="Open WhatsApp chat"
            className="absolute inset-0 cursor-pointer rounded-2xl border-0 bg-transparent"
          />

          <span
            aria-hidden="true"
            className="absolute -bottom-1.5 right-7 h-3 w-3 rotate-45 bg-white"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => (panelOpen ? setPanelOpen(false) : openPanel())}
        aria-label={
          panelOpen ? "Close WhatsApp chat" : "Chat with us on WhatsApp"
        }
        aria-expanded={panelOpen}
        className="relative flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-0 text-white transition-transform duration-300 ease-out hover:scale-105 max-[640px]:h-14 max-[640px]:w-14"
        style={{ backgroundColor: BRAND }}
      >
        {!panelOpen && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: BRAND }}
          />
        )}
        {panelOpen ? (
          <X className="relative h-7 w-7" />
        ) : (
          <>
            <WhatsAppIcon className="relative h-8 w-8 max-[640px]:h-7 max-[640px]:w-7" />
            <span
              aria-hidden="true"
              className="absolute top-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#ef4444]"
            />
          </>
        )}
      </button>
    </div>
  );
}
