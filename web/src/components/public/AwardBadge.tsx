const AWARD = "2025 Sony World Photography Award Winner";

/**
 * A standing credit pinned to the bottom-left corner of every public page,
 * opposite the WhatsApp widget: same offsets from the edges and the same
 * layer, so the two frame the screen as a pair and stay put while the page
 * scrolls beneath them.
 *
 * On phones it may wrap to two lines rather than run into the chat button.
 */
export function AwardBadge() {
  return (
    <p className="modernist fixed bottom-6 left-6 z-100 m-0 flex max-w-[calc(100vw-120px)] items-center gap-2 rounded-full border-[1.5px] border-[#c9a54c] bg-[linear-gradient(180deg,#2e2d2b_0%,#1d1c1b_100%)] px-6 py-3.5 text-[15px] leading-snug text-md-light shadow-[0_10px_28px_rgba(0,0,0,.45)] max-[640px]:bottom-4.5 max-[640px]:left-4.5 max-[640px]:gap-1.5 max-[640px]:px-4 max-[640px]:py-2.5 max-[640px]:text-[12px]">
      <span aria-hidden className="flex-none">
        🏆
      </span>
      <span>{AWARD}</span>
    </p>
  );
}
