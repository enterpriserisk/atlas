import { cn } from "@/lib/cn";

/**
 * NonUniversityToolBadge — consistent notice used EVERYWHERE a tool that is not provided
 * or endorsed by U-M is mentioned (per brief spec, never buried in body text).
 *
 * Two forms:
 * - variant="badge": compact pill for tight spots (tool cards, inline lists)
 * - variant="banner": full callout for prominent placement on a tool detail/recommendation
 *
 * Uses the same blue/info family as AiAssistedNotice with an ℹ glyph — informational, not
 * alarming, while still never relying on color alone.
 */

const MESSAGE =
  "Not provided or endorsed by the University of Michigan — verify data-handling and approval status before use.";

interface Props {
  variant?: "badge" | "banner";
  className?: string;
}

export function NonUniversityToolBadge({ variant = "badge", className }: Props) {
  if (variant === "banner") {
    return (
      <div
        role="note"
        className={cn(
          "flex items-start gap-2 rounded-md border border-[#bcd0e8] bg-[#e5edf6] px-3 py-2 text-sm text-[#1d3f68]",
          className,
        )}
      >
        <span aria-hidden="true" className="mt-0.5 shrink-0 font-bold">
          ℹ
        </span>
        <p>
          <span className="font-semibold">External tool.</span> {MESSAGE}
        </p>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[#bcd0e8] bg-[#e5edf6] px-2.5 py-0.5 text-xs font-semibold text-[#1d3f68]",
        className,
      )}
      title={MESSAGE}
    >
      <span aria-hidden="true">ℹ</span>
      External tool — verify before use
      <span className="sr-only">. {MESSAGE}</span>
    </span>
  );
}
