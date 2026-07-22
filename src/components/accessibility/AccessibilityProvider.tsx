"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Accessibility preferences shared across ATLAS.
 * - `legibleFont`: swaps the whole UI to Atkinson Hyperlegible (per brand guide a11y section).
 * - `fontScale`: user-selectable base font size (rem-scaled from globals.css).
 *
 * Preferences persist to localStorage and are applied to the <html> element so CSS
 * (data-font-scale attribute + .font-legible class) can react without re-rendering the tree.
 */

export type FontScale = "normal" | "large" | "x-large";

interface AccessibilityState {
  legibleFont: boolean;
  fontScale: FontScale;
  toggleLegibleFont: () => void;
  setFontScale: (scale: FontScale) => void;
}

const STORAGE_KEY = "atlas:a11y";

const AccessibilityContext = createContext<AccessibilityState | null>(null);

function applyToDocument(legibleFont: boolean, fontScale: FontScale) {
  const root = document.documentElement;
  root.classList.toggle("font-legible", legibleFont);
  root.dataset.fontScale = fontScale;
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [legibleFont, setLegibleFont] = useState(false);
  const [fontScale, setFontScaleState] = useState<FontScale>("normal");

  // Hydrate saved preferences on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AccessibilityState>;
        const nextLegible = Boolean(parsed.legibleFont);
        const nextScale = (parsed.fontScale as FontScale) ?? "normal";
        setLegibleFont(nextLegible);
        setFontScaleState(nextScale);
        applyToDocument(nextLegible, nextScale);
      }
    } catch {
      // Ignore malformed storage; fall back to defaults.
    }
  }, []);

  const persist = useCallback((legible: boolean, scale: FontScale) => {
    applyToDocument(legible, scale);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ legibleFont: legible, fontScale: scale }),
      );
    } catch {
      // Storage may be unavailable (private mode); preferences still apply for the session.
    }
  }, []);

  const toggleLegibleFont = useCallback(() => {
    setLegibleFont((prev) => {
      const next = !prev;
      persist(next, fontScale);
      return next;
    });
  }, [fontScale, persist]);

  const setFontScale = useCallback(
    (scale: FontScale) => {
      setFontScaleState(scale);
      persist(legibleFont, scale);
    },
    [legibleFont, persist],
  );

  const value = useMemo(
    () => ({ legibleFont, fontScale, toggleLegibleFont, setFontScale }),
    [legibleFont, fontScale, toggleLegibleFont, setFontScale],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityState {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return ctx;
}
