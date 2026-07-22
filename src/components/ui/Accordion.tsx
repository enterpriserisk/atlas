"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Accordion — accessible expandable sections built on native <button> + region semantics.
 * Keyboard operable (button is focusable, Enter/Space toggles), aria-expanded/controls wired.
 * Supports single or multiple open sections.
 */

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  /** Optional trailing element in the header (e.g., a status badge). */
  meta?: React.ReactNode;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Allow multiple panels open at once (default true). */
  allowMultiple?: boolean;
  /** IDs of panels open on first render. */
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = true,
  defaultOpen = [],
  className,
}: AccordionProps) {
  const [open, setOpen] = useState<Set<string>>(new Set(defaultOpen));
  const baseId = useId();

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className={cn("divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle bg-white", className)}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const headerId = `${baseId}-${item.id}-header`;
        const panelId = `${baseId}-${item.id}-panel`;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
              >
                <span className="flex flex-1 items-center gap-3 text-base font-semibold text-um-blue">
                  {item.title}
                  {item.meta}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "shrink-0 text-um-blue transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                >
                  ▾
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
              className="px-5 pb-5 pt-1 text-um-black-metallic"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
