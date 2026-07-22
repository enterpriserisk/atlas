"use client";

import { useEffect, useRef, useState } from "react";
import { useAccessibility, type FontScale } from "./AccessibilityProvider";

/**
 * Header accessibility control: toggle high-legibility font and adjust text size.
 * Implemented as a button-triggered dialog (not an ARIA menu — its contents are form
 * controls, not menuitems). Fully keyboard-operable: focus moves into the panel on open
 * and returns to the trigger on close; Escape and outside-click dismiss.
 */

const SCALE_OPTIONS: { value: FontScale; label: string }[] = [
  { value: "normal", label: "Standard" },
  { value: "large", label: "Large" },
  { value: "x-large", label: "Extra large" },
];

export function AccessibilityMenu() {
  const { legibleFont, fontScale, toggleLegibleFont, setFontScale } = useAccessibility();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus management: move focus into the panel on open, restore to trigger on close.
  useEffect(() => {
    if (open) {
      panelRef.current?.querySelector<HTMLElement>("button, [href], select")?.focus();
    }
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Accessibility options"
        className="inline-flex items-center gap-2 rounded-md border border-white/25 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-maize"
      >
        {/* Universal accessibility glyph, decorative (label provided above). */}
        <span aria-hidden="true" className="text-base leading-none">
          &#9855;
        </span>
        <span className="hidden sm:inline">Accessibility</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Accessibility options"
          className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-border-subtle bg-white p-4 text-um-black-metallic shadow-lg"
        >
          <fieldset className="mb-4">
            <legend className="mb-2 text-sm font-semibold">Text size</legend>
            <div className="flex gap-1">
              {SCALE_OPTIONS.map((opt) => {
                const active = fontScale === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFontScale(opt.value)}
                    className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue ${
                      active
                        ? "border-um-blue bg-um-blue text-white"
                        : "border-border-subtle bg-white hover:bg-surface-muted"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex items-center justify-between gap-3">
            <label htmlFor="legible-font-toggle" className="text-sm font-medium">
              High-legibility font
            </label>
            <button
              id="legible-font-toggle"
              type="button"
              role="switch"
              aria-checked={legibleFont}
              onClick={toggleLegibleFont}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue ${
                legibleFont ? "bg-um-blue" : "bg-um-ash"
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  legibleFont ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          <p className="mt-2 text-xs text-um-stone">
            Switches ATLAS to the Atkinson Hyperlegible typeface for easier reading.
          </p>
        </div>
      )}
    </div>
  );
}
