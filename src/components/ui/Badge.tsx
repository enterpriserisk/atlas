import { cn } from "@/lib/cn";

/**
 * Badge — compact status/label pill. Tones use only approved contrast pairings.
 * Every tone pairs an icon/glyph with color so meaning never relies on color alone
 * (WCAG 1.4.1 + brand guide accessible data-viz guidance).
 */

type Tone =
  | "neutral"
  | "blue"
  | "maize"
  | "success"
  | "warning"
  | "danger"
  | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-um-black-metallic border-border-subtle",
  blue: "bg-um-blue text-white border-um-blue",
  maize: "bg-um-maize text-um-blue border-um-maize",
  // success = Rackham Green surface, dark text (approved, ~ readable); paired with ✓
  success: "bg-[#e6efe9] text-[#2f4d40] border-[#bcd3c7]",
  // warning = Ross Orange family, dark text; paired with ⚠
  warning: "bg-[#fbe9dc] text-[#7a3406] border-[#f0c39c]",
  // danger = Tappan Red family, dark text; paired with ✕
  danger: "bg-[#f6e3e0] text-um-tappan-red border-[#e2b5ae]",
  info: "bg-[#e5edf6] text-[#1d3f68] border-[#bcd0e8]",
};

const defaultGlyphs: Partial<Record<Tone, string>> = {
  success: "✓",
  warning: "⚠",
  danger: "✕",
  info: "ℹ",
};

interface BadgeProps {
  tone?: Tone;
  /** Override or set the leading glyph. Pass null to omit. */
  glyph?: string | null;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ tone = "neutral", glyph, className, children }: BadgeProps) {
  const resolvedGlyph = glyph === undefined ? defaultGlyphs[tone] : glyph;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {resolvedGlyph && (
        <span aria-hidden="true" className="leading-none">
          {resolvedGlyph}
        </span>
      )}
      {children}
    </span>
  );
}

/**
 * Human-review status badge — used across the Playbook and Advisor.
 * Distinct, consistent styling for Yes / No / Conditional review requirements.
 */
export function HumanReviewBadge({
  status,
  reason,
}: {
  status: "Yes" | "No" | "Conditional";
  reason?: string;
}) {
  const tone: Tone = status === "Yes" ? "danger" : status === "Conditional" ? "warning" : "success";
  const label =
    status === "Yes"
      ? "Human review required"
      : status === "Conditional"
        ? "Human review: conditional"
        : "Human review: not required";
  return (
    <Badge tone={tone}>
      {label}
      {reason ? ` — ${reason}` : ""}
    </Badge>
  );
}
