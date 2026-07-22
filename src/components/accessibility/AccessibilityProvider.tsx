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

interface Prefs {
  legibleFont: boolean;
  fontScale: FontScale;
}

interface AccessibilityState extends Prefs {
  toggleLegibleFont: () => void;
  setFontScale: (scale: FontScale) => void;
}

const STORAGE_KEY = "atlas:a11y";
const DEFAULT_PREFS: Prefs = { legibleFont: false, fontScale: "normal" };

const AccessibilityContext = createContext<AccessibilityState | null>(null);

function applyToDocument({ legibleFont, fontScale }: Prefs) {
  const root = document.documentElement;
  root.classList.toggle("font-legible", legibleFont);
  root.dataset.fontScale = fontScale;
}

function readStored(): Prefs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      legibleFont: Boolean(parsed.legibleFont),
      fontScale: (parsed.fontScale as FontScale) ?? "normal",
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  // Starts at defaults so the server-rendered markup matches first client render
  // (no hydration mismatch). The stored prefs are loaded once, post-mount, below.
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  // Hydrate saved preferences from localStorage on mount. This is a one-time sync from an
  // external store into React state; it must run after hydration (localStorage is unavailable
  // during SSR), so a single post-mount state update is the correct pattern here.
  useEffect(() => {
    const stored = readStored();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time hydration from localStorage
    setPrefs(stored);
    applyToDocument(stored);
  }, []);

  // Applies a preference change: updates React state, the <html> element, and localStorage.
  const commit = useCallback((updater: (prev: Prefs) => Prefs) => {
    setPrefs((prev) => {
      const next = updater(prev);
      applyToDocument(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage may be unavailable (private mode); preferences still apply for the session.
      }
      return next;
    });
  }, []);

  const toggleLegibleFont = useCallback(
    () => commit((prev) => ({ ...prev, legibleFont: !prev.legibleFont })),
    [commit],
  );

  const setFontScale = useCallback(
    (scale: FontScale) => commit((prev) => ({ ...prev, fontScale: scale })),
    [commit],
  );

  const value = useMemo<AccessibilityState>(
    () => ({ ...prefs, toggleLegibleFont, setFontScale }),
    [prefs, toggleLegibleFont, setFontScale],
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
