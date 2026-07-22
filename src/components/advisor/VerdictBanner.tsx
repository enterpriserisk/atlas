import { HumanReviewBadge } from "@/components/ui";
import type { Assessment, Verdict } from "@/lib/advisor/types";

/**
 * VerdictBanner — the Step 2 verdict headline + reasons + human-review flag.
 * Verdict is conveyed by an explicit label and icon, not color alone.
 */

const VERDICT_META: Record<
  Verdict,
  { label: string; icon: string; className: string }
> = {
  recommended: {
    label: "AI Recommended",
    icon: "✓",
    className: "border-[#2f7a4d] bg-[#eef6f0] text-[#2f4d40]",
  },
  caution: {
    label: "AI Possible with Caution",
    icon: "⚠",
    className: "border-um-ross-orange bg-[#fbe9dc] text-[#7a3406]",
  },
  "not-recommended": {
    label: "AI Not Recommended for This Task",
    icon: "✕",
    className: "border-um-tappan-red bg-[#f6e3e0] text-um-tappan-red",
  },
};

export function VerdictBanner({ assessment }: { assessment: Assessment }) {
  const meta = VERDICT_META[assessment.verdict];
  return (
    <div className={`rounded-lg border-2 p-5 ${meta.className}`}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold"
        >
          {meta.icon}
        </span>
        <h3 className="text-xl font-bold">{meta.label}</h3>
      </div>

      <ul className="mt-4 space-y-2">
        {assessment.reasons.map((reason, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed">
            <span aria-hidden="true">•</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <HumanReviewBadge
          status={assessment.humanReview.status}
          reason={assessment.humanReview.reason}
        />
      </div>
    </div>
  );
}
