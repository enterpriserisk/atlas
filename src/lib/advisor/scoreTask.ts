import type {
  Assessment,
  AxisScore,
  Dimension,
  ReviewStatus,
  TaskInput,
  Verdict,
} from "./types";

/**
 * scoreTask — the transparent, deterministic core of the AI Task Advisor.
 *
 * DESIGN PRINCIPLES (per project brief):
 * - Deterministic & auditable: same input -> same output. No LLM call, no randomness.
 * - Fully documented: every score is explained in plain language so ERO staff can trust
 *   and TUNE it. Keyword lists and thresholds below are meant to be edited by future staff.
 * - Extendable: generatePrompt() (in generatePrompt.ts) marks where an LLM could later be
 *   swapped in to draft prose, without changing this scoring logic.
 *
 * HOW IT WORKS:
 * Each of five dimensions is scored 1–5 from (a) the structured fields and (b) keyword
 * heuristics over the free-text description. Scores + verdict + human-review status are
 * derived by simple, inspectable rules. This is decision SUPPORT, not an approval.
 */

// ---------------------------------------------------------------------------
// Tunable keyword lexicons. Future staff: add/remove terms to adjust sensitivity.
// Matching is case-insensitive, whole-ish word (substring) matching on the description.
// ---------------------------------------------------------------------------

const KEYWORDS = {
  /** Signals the task touches sensitive/regulated/personal data. */
  sensitive: [
    "ssn", "social security", "personal", "confidential", "hipaa", "phi", "pii",
    "medical", "health", "financial", "salary", "student record", "ferpa",
    "password", "credential", "private", "regulated", "protected", "sensitive",
  ],
  /** Signals high impact if the output is wrong. */
  highImpact: [
    "legal", "compliance", "policy", "contract", "audit", "regulatory", "lawsuit",
    "official", "board", "decision", "determination", "budget", "safety", "risk assessment",
  ],
  /** Signals the task needs significant human judgment / context. */
  judgment: [
    "judgment", "sensitive topic", "negotiat", "strategy", "ethical", "nuanced",
    "interpret", "discretion", "personnel", "hr", "disciplin", "grievance", "confidential advice",
  ],
  /** Signals a repetitive/mechanical task where AI saves a lot of time. */
  timeSaver: [
    "draft", "summar", "rewrite", "reformat", "outline", "brainstorm", "template",
    "boilerplate", "notes", "recap", "translate", "list", "email", "faq",
  ],
  /** Signals complexity/nuance in the task. */
  complex: [
    "complex", "technical", "detailed", "multi", "analysis", "analyze", "synthesi",
    "research", "cross-reference", "reconcile", "novel", "ambiguous",
  ],
} as const;

const DIMENSION_LABELS: Record<Dimension, string> = {
  timeSavings: "Time savings potential",
  complexity: "Task complexity / nuance",
  riskIfWrong: "Risk if output is wrong",
  dataSensitivity: "Data sensitivity",
  humanJudgment: "Need for human judgment",
};

/** Count how many keywords from a list appear in the (lowercased) text. */
function countMatches(text: string, keywords: readonly string[]): number {
  return keywords.reduce((n, kw) => (text.includes(kw) ? n + 1 : n), 0);
}

/** Clamp to the 1–5 scale. */
function clamp(n: number): number {
  return Math.max(1, Math.min(5, Math.round(n)));
}

export function scoreTask(input: TaskInput): Assessment {
  const text = (input.description || "").toLowerCase();

  // --- Dimension 1: Time savings potential ---------------------------------
  // Higher when the task looks repetitive/mechanical (drafting, summarizing) and
  // when there is deadline pressure (AI helps most when time is short).
  let timeSavings = 2 + Math.min(2, countMatches(text, KEYWORDS.timeSaver));
  if (input.deadline === "soon") timeSavings += 1;
  if (input.deadline === "urgent") timeSavings += 1;
  if (["drafting", "summarization", "communications"].includes(input.taskType ?? "")) {
    timeSavings += 1;
  }
  timeSavings = clamp(timeSavings);

  // --- Dimension 2: Complexity / nuance ------------------------------------
  let complexity = 2 + Math.min(2, countMatches(text, KEYWORDS.complex));
  if (["research", "data-analysis", "risk-assessment"].includes(input.taskType ?? "")) {
    complexity += 1;
  }
  complexity = clamp(complexity);

  // --- Dimension 3: Risk if output is wrong --------------------------------
  // Driven by impact keywords and by audience (external/leadership raises the stakes).
  let riskIfWrong = 1 + Math.min(2, countMatches(text, KEYWORDS.highImpact));
  if (input.audience === "leadership") riskIfWrong += 1;
  if (input.audience === "external") riskIfWrong += 2;
  if (input.audience === "public") riskIfWrong += 2;
  if (["risk-assessment", "data-analysis"].includes(input.taskType ?? "")) riskIfWrong += 1;
  riskIfWrong = clamp(riskIfWrong);

  // --- Dimension 4: Data sensitivity ---------------------------------------
  let dataSensitivity = 1 + Math.min(3, countMatches(text, KEYWORDS.sensitive));
  if (input.sensitiveData === "yes") dataSensitivity = Math.max(dataSensitivity, 5);
  if (input.sensitiveData === "unsure") dataSensitivity = Math.max(dataSensitivity, 3);
  dataSensitivity = clamp(dataSensitivity);

  // --- Dimension 5: Need for human judgment --------------------------------
  let humanJudgment = 1 + Math.min(2, countMatches(text, KEYWORDS.judgment));
  // Judgment need tracks impact and sensitivity too.
  if (riskIfWrong >= 4) humanJudgment += 1;
  if (dataSensitivity >= 4) humanJudgment += 1;
  humanJudgment = clamp(humanJudgment);

  const axes: AxisScore[] = [
    axis("timeSavings", timeSavings, reasonForTime(timeSavings)),
    axis("complexity", complexity, reasonForComplexity(complexity)),
    axis("riskIfWrong", riskIfWrong, reasonForRisk(riskIfWrong, input)),
    axis("dataSensitivity", dataSensitivity, reasonForSensitivity(dataSensitivity, input)),
    axis("humanJudgment", humanJudgment, reasonForJudgment(humanJudgment)),
  ];

  const { verdict, reasons } = deriveVerdict({
    timeSavings,
    complexity,
    riskIfWrong,
    dataSensitivity,
    humanJudgment,
  });

  const humanReview = deriveHumanReview({ riskIfWrong, dataSensitivity, humanJudgment, input });

  return { axes, verdict, reasons, humanReview };
}

function axis(dimension: Dimension, score: number, reason: string): AxisScore {
  return { dimension, label: DIMENSION_LABELS[dimension], score, reason };
}

// ---------------------------------------------------------------------------
// Verdict logic — simple, inspectable thresholds.
// ---------------------------------------------------------------------------

interface Scores {
  timeSavings: number;
  complexity: number;
  riskIfWrong: number;
  dataSensitivity: number;
  humanJudgment: number;
}

function deriveVerdict(s: Scores): { verdict: Verdict; reasons: string[] } {
  const reasons: string[] = [];

  // Hard blockers push toward "not recommended".
  const highSensitivity = s.dataSensitivity >= 5;
  const highRisk = s.riskIfWrong >= 5;
  const highJudgment = s.humanJudgment >= 5;

  if (highSensitivity) {
    reasons.push(
      "This task appears to involve highly sensitive or regulated data — using AI here is not advised unless you can fully remove or anonymize that data and use an approved tool.",
    );
  }
  if (highRisk) {
    reasons.push(
      "The impact of an error looks high (e.g., external/leadership-facing or consequential), so unreviewed AI output carries real risk.",
    );
  }

  let verdict: Verdict;
  if (highSensitivity || (highRisk && highJudgment)) {
    verdict = "not-recommended";
  } else if (s.riskIfWrong >= 4 || s.dataSensitivity >= 4 || s.humanJudgment >= 4) {
    verdict = "caution";
    reasons.push(
      "AI can help, but the risk, sensitivity, or judgment involved means you should use it carefully and review the output closely.",
    );
  } else {
    verdict = "recommended";
    reasons.push(
      "This looks like a good fit for AI assistance: the risk of error is manageable and the data is not highly sensitive.",
    );
  }

  // Always add the upside if there is meaningful time savings.
  if (s.timeSavings >= 4) {
    reasons.push(
      "There is strong time-savings potential — this is the kind of drafting/summarizing work AI does well as a first pass.",
    );
  }
  if (s.complexity >= 4 && verdict !== "not-recommended") {
    reasons.push(
      "The task is fairly complex, so treat AI output as a draft and verify the details rather than accepting it wholesale.",
    );
  }

  // Keep to 2–4 bullets.
  return { verdict, reasons: reasons.slice(0, 4) };
}

function deriveHumanReview(args: {
  riskIfWrong: number;
  dataSensitivity: number;
  humanJudgment: number;
  input: TaskInput;
}): { status: ReviewStatus; reason: string } {
  const { riskIfWrong, dataSensitivity, humanJudgment, input } = args;

  const drivers: string[] = [];
  if (input.audience === "external" || input.audience === "public") drivers.push("external-facing output");
  if (input.audience === "leadership") drivers.push("leadership-facing output");
  if (dataSensitivity >= 4) drivers.push("touches sensitive data");
  if (riskIfWrong >= 4) drivers.push("high impact if wrong");
  if (humanJudgment >= 4) drivers.push("significant human judgment required");

  let status: ReviewStatus;
  if (dataSensitivity >= 5 || riskIfWrong >= 5 || input.audience === "external" || input.audience === "public") {
    status = "Yes";
  } else if (drivers.length > 0) {
    status = "Conditional";
  } else {
    status = "No";
  }

  const reason =
    drivers.length > 0
      ? drivers.join("; ")
      : "low impact and no sensitive data detected — a light self-check is still wise";
  return { status, reason };
}

// ---------------------------------------------------------------------------
// Per-axis plain-language reason strings.
// ---------------------------------------------------------------------------

function reasonForTime(score: number): string {
  if (score >= 4) return "Looks like repetitive drafting/summarizing work where AI saves the most time.";
  if (score >= 3) return "Some time savings likely from an AI first draft.";
  return "Limited time savings — the task may not be a natural fit for automation.";
}

function reasonForComplexity(score: number): string {
  if (score >= 4) return "Fairly complex or nuanced — expect to verify and refine AI output.";
  if (score >= 3) return "Moderately complex; AI output will need review.";
  return "Relatively straightforward.";
}

function reasonForRisk(score: number, input: TaskInput): string {
  if (score >= 4)
    return `High impact if wrong${input.audience ? ` (${input.audience}-facing)` : ""} — errors would be costly.`;
  if (score >= 3) return "Moderate impact if the output contains errors.";
  return "Low impact if the output is imperfect.";
}

function reasonForSensitivity(score: number, input: TaskInput): string {
  if (score >= 4) return "Appears to involve sensitive or regulated data — handle with care and use approved tools only.";
  if (score >= 3 || input.sensitiveData === "unsure")
    return "May involve some sensitive data — confirm before entering anything into a tool.";
  return "No sensitive data detected in the description.";
}

function reasonForJudgment(score: number): string {
  if (score >= 4) return "Needs substantial human judgment, context, or discretion.";
  if (score >= 3) return "Some human judgment needed to finalize.";
  return "Minimal specialized judgment required.";
}
