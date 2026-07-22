"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

/** CopyButton — copies text to the clipboard with a brief confirmation. */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable; no-op (user can select manually).
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={copy} aria-live="polite">
      {copied ? "✓ Copied" : label}
    </Button>
  );
}
