/** Types for the AI Task Advisor decision engine. */

/** Structured intake from Step 1. Free-text description + optional structured fields. */
export interface TaskInput {
  /** Free-text task description (the primary input). */
  description: string;
  /** Optional task-type hint. */
  taskType?: TaskType;
  /** Does the task involve personal/confidential/regulated data? */
  sensitiveData?: "yes" | "no" | "unsure";
  /** Audience of the output. */
  audience?: "internal" | "leadership" | "external" | "public";
  /** Deadline pressure. */
  deadline?: "none" | "soon" | "urgent";
}

export type TaskType =
  | "drafting"
  | "summarization"
  | "research"
  | "data-analysis"
  | "communications"
  | "risk-assessment"
  | "other";

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  drafting: "Drafting & writing",
  summarization: "Summarizing",
  research: "Research",
  "data-analysis": "Data analysis",
  communications: "Communications",
  "risk-assessment": "Risk assessment",
  other: "Other",
};

/** The five assessment dimensions (radar chart axes). Each scored 1–5. */
export type Dimension =
  | "timeSavings"
  | "complexity"
  | "riskIfWrong"
  | "dataSensitivity"
  | "humanJudgment";

export interface AxisScore {
  dimension: Dimension;
  label: string;
  /** 1–5 score. */
  score: number;
  /** Plain-language explanation of why this score. */
  reason: string;
}

export type Verdict = "recommended" | "caution" | "not-recommended";

export type ReviewStatus = "Yes" | "No" | "Conditional";

export interface Assessment {
  axes: AxisScore[];
  verdict: Verdict;
  /** 2–4 plain-language bullets explaining the verdict. */
  reasons: string[];
  humanReview: {
    status: ReviewStatus;
    reason: string;
  };
}
