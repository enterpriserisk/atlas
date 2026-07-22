import { HumanReviewBadge, Badge } from "@/components/ui";
import type { Tool } from "@/lib/content/types";
import type { Assessment, TaskInput, Verdict } from "@/lib/advisor/types";

const VERDICT_LABEL: Record<Verdict, string> = {
  recommended: "AI Recommended",
  caution: "AI Possible with Caution",
  "not-recommended": "AI Not Recommended",
};

/**
 * AssessmentSummary — compact, printable recap of the session: task, verdict, axis scores,
 * human-review flag, and chosen tool. Reused in Step 4 and the exportable summary.
 */
export function AssessmentSummary({
  input,
  assessment,
  tool,
}: {
  input: TaskInput;
  assessment: Assessment;
  tool: Tool | null;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-white p-5">
      <dl className="space-y-3 text-sm">
        <Row label="Task">{input.description}</Row>
        <Row label="Verdict">
          <span className="font-semibold text-um-blue">{VERDICT_LABEL[assessment.verdict]}</span>
        </Row>
        <Row label="Human review">
          <HumanReviewBadge
            status={assessment.humanReview.status}
            reason={assessment.humanReview.reason}
          />
        </Row>
        <Row label="Scores">
          <ul className="flex flex-wrap gap-2">
            {assessment.axes.map((a) => (
              <li key={a.dimension}>
                <Badge tone="neutral" glyph={null}>
                  {a.label}: {a.score}/5
                </Badge>
              </li>
            ))}
          </ul>
        </Row>
        {tool && <Row label="Chosen tool">{tool.name}</Row>}
      </dl>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 border-b border-border-subtle pb-3 last:border-0 last:pb-0">
      <dt className="font-semibold text-um-stone">{label}</dt>
      <dd className="text-um-black-metallic">{children}</dd>
    </div>
  );
}
