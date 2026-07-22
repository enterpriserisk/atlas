import { cn } from "@/lib/cn";

/**
 * AiAssistedNotice — transparency marker (per brief: "practice what the tool preaches").
 * Every AI-generated or AI-assisted recommendation in ATLAS (advisor verdict, tool
 * suggestion, generated prompt) is visibly marked as guidance requiring human judgment.
 *
 * variant="inline": small label to sit next to a heading/result
 * variant="banner": full callout above a generated block
 */

const DEFAULT_MESSAGE =
  "This is AI-use guidance, not an approval. Apply your own judgment and verify against current U-M policy.";

interface Props {
  variant?: "inline" | "banner";
  message?: string;
  className?: string;
}

export function AiAssistedNotice({ variant = "inline", message = DEFAULT_MESSAGE, className }: Props) {
  if (variant === "banner") {
    return (
      <div
        role="note"
        className={cn(
          "flex items-start gap-2 rounded-md border border-um-arboretum-blue bg-[#e5edf6] px-3 py-2 text-sm text-[#1d3f68]",
          className,
        )}
      >
        <span aria-hidden="true" className="mt-0.5 shrink-0" title="AI-assisted guidance">
          ✦
        </span>
        <p>
          <span className="font-semibold">AI-assisted guidance.</span> {message}
        </p>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-um-arboretum-blue bg-[#e5edf6] px-2.5 py-0.5 text-xs font-semibold text-[#1d3f68]",
        className,
      )}
      title={message}
    >
      <span aria-hidden="true">✦</span>
      AI-assisted guidance
      <span className="sr-only">. {message}</span>
    </span>
  );
}
