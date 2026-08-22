"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  question: string;
  answer: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Index open on first render; -1 for all closed. */
  defaultOpen?: number;
  className?: string;
}

/**
 * Single-open accordion. Hand-rolled to match the other primitives in this
 * folder, which are plain React rather than Radix-backed.
 */
export function Accordion({
  items,
  defaultOpen = 0,
  className,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("border-t-2 border-md-divider", className)}>
      {items.map((item, i) => {
        const isOpen = i === open;
        return (
          <div key={item.question} className="border-b-2 border-md-divider">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-6 border-0 bg-transparent px-0 py-5 text-left transition-colors duration-200 hover:text-md-red"
            >
              <span className="text-[16px] font-semibold">{item.question}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 flex-none transition-transform duration-300",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {/* 0fr -> 1fr animates the height without a measured max-height. */}
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="mt-0 mb-5 max-w-[780px] text-[14px] leading-[1.75] text-md-700">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
