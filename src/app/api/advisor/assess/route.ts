import { NextResponse } from "next/server";
import { getTools } from "@/lib/content/loaders";
import { callGroqJSON, isGroqError } from "@/lib/advisor/groq";
import type {
  Assessment,
  AxisScore,
  Dimension,
  ReviewStatus,
  TaskInput,
  ToolRecommendation,
  Verdict,
} from "@/lib/advisor/types";

/**
 * POST /api/advisor/assess — the AI Task Advisor's assessment step.
 * Takes a TaskInput, asks the model (via Groq) to reason about it (not keyword-match
 * it), and returns both the five-axis assessment and a ranking of every tool in
 * content/tools.json. Server-only: this is the only place GROQ_API_KEY is read.
 */

const DIMENSION_LABELS: Record<Dimension, string> = {
  timeSavings: "Time savings potential",
  complexity: "Task complexity / nuance",
  riskIfWrong: "Risk if output is wrong",
  dataSensitivity: "Data sensitivity",
  humanJudgment: "Need for human judgment",
};

interface AssessResponse {
  axes: { dimension: Dimension; score: number; reason: string }[];
  verdict: Verdict;
  reasons: string[];
  humanReview: { status: ReviewStatus; reason: string };
  toolRankings: { toolId: string; score: number; fitReason: string }[];
}

// We use the broadly-supported `json_object` response mode (not the stricter
// `json_schema`) and embed this shape directly in the prompt as an instruction, then parse
// defensively on the way back — cheap insurance even on a specific, reliable model.
const RESPONSE_SHAPE = {
  type: "object",
  properties: {
    axes: {
      type: "array",
      description: "Exactly one entry per dimension, in this order: timeSavings, complexity, riskIfWrong, dataSensitivity, humanJudgment.",
      items: {
        type: "object",
        properties: {
          dimension: {
            type: "string",
            enum: ["timeSavings", "complexity", "riskIfWrong", "dataSensitivity", "humanJudgment"],
          },
          score: { type: "integer", description: "1 (low) to 5 (high)." },
          reason: { type: "string", description: "One specific sentence referencing details of THIS task." },
        },
        required: ["dimension", "score", "reason"],
      },
    },
    verdict: { type: "string", enum: ["recommended", "caution", "not-recommended"] },
    reasons: {
      type: "array",
      description: "2 to 4 plain-language bullets explaining the verdict, specific to this task.",
      items: { type: "string" },
    },
    humanReview: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["Yes", "No", "Conditional"] },
        reason: { type: "string" },
      },
      required: ["status", "reason"],
    },
    toolRankings: {
      type: "array",
      description: "Rank every tool provided, best fit first.",
      items: {
        type: "object",
        properties: {
          toolId: { type: "string" },
          score: { type: "number", description: "0 (poor fit) to 10 (excellent fit)." },
          fitReason: { type: "string", description: "One sentence tying the fit to specifics of this task." },
        },
        required: ["toolId", "score", "fitReason"],
      },
    },
  },
  required: ["axes", "verdict", "reasons", "humanReview", "toolRankings"],
} as const;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = body as TaskInput;
  if (!input?.description || input.description.trim().length < 5) {
    return NextResponse.json({ error: "Task description is required." }, { status: 400 });
  }

  const tools = getTools();

  const prompt = buildPrompt(input, tools);

  let raw: AssessResponse;
  try {
    raw = await callGroqJSON<AssessResponse>({ input: prompt });
  } catch (err) {
    const message = isGroqError(err) ? err.message : "Unexpected error calling the AI model.";
    const status = isGroqError(err) && err.status ? err.status : 502;
    return NextResponse.json({ error: message }, { status });
  }

  // json_object mode enforces valid JSON, not a specific schema — normalize defensively
  // rather than trusting every field is present and well-typed.
  const rawAxes = Array.isArray(raw?.axes) ? raw.axes : [];
  const axesByDimension = new Map(rawAxes.map((a) => [a?.dimension, a]));
  const DIMENSIONS: Dimension[] = ["timeSavings", "complexity", "riskIfWrong", "dataSensitivity", "humanJudgment"];
  const axes: AxisScore[] = DIMENSIONS.map((dimension) => {
    const a = axesByDimension.get(dimension);
    return {
      dimension,
      label: DIMENSION_LABELS[dimension],
      score: clamp(typeof a?.score === "number" ? a.score : 3),
      reason: typeof a?.reason === "string" && a.reason ? a.reason : "The model did not return a reason for this axis.",
    };
  });

  const VALID_VERDICTS: Verdict[] = ["recommended", "caution", "not-recommended"];
  const verdict: Verdict = VALID_VERDICTS.includes(raw?.verdict) ? raw.verdict : "caution";

  const reasons =
    Array.isArray(raw?.reasons) && raw.reasons.length > 0
      ? raw.reasons.filter((r): r is string => typeof r === "string")
      : ["The model did not return specific reasoning — treat this verdict with extra caution."];

  const VALID_REVIEW_STATUSES: ReviewStatus[] = ["Yes", "No", "Conditional"];
  const humanReview =
    raw?.humanReview && VALID_REVIEW_STATUSES.includes(raw.humanReview.status)
      ? raw.humanReview
      : { status: "Conditional" as ReviewStatus, reason: "The model did not return a clear human-review recommendation." };

  const assessment: Assessment = { axes, verdict, reasons, humanReview };

  const byId = new Map(tools.map((t) => [t.id, t]));
  const ranked: ToolRecommendation[] = [];
  const seen = new Set<string>();

  const toolRankings = Array.isArray(raw?.toolRankings) ? raw.toolRankings : [];
  for (const r of toolRankings) {
    const tool = byId.get(r?.toolId);
    if (!tool || seen.has(tool.id) || typeof r.score !== "number") continue;
    seen.add(tool.id);
    ranked.push({ tool, score: r.score, fitReason: typeof r.fitReason === "string" ? r.fitReason : "" });
  }
  // Guarantee every tool appears even if the model skipped one, so nothing silently
  // disappears from the Step 3 comparison grid.
  for (const tool of tools) {
    if (!seen.has(tool.id)) {
      ranked.push({ tool, score: 0, fitReason: "A general-purpose option not specifically matched to this task." });
    }
  }
  ranked.sort((a, b) => b.score - a.score);

  return NextResponse.json({ assessment, recommendations: ranked });
}

function clamp(n: number): number {
  return Math.max(1, Math.min(5, Math.round(n)));
}

function buildPrompt(input: TaskInput, tools: ReturnType<typeof getTools>): string {
  const lines: string[] = [];
  lines.push(
    "You are the assessment engine behind ATLAS, an AI-use advisor for University of Michigan " +
      "Enterprise Risk Management staff. Given a task someone is about to do, you decide whether " +
      "AI assistance is appropriate, score five risk/benefit dimensions, and rank the available AI " +
      "tools for that specific task. Be specific to the task described — never give generic, " +
      "boilerplate reasoning that could apply to any task.",
  );
  lines.push("");
  lines.push("Score each of these five dimensions from 1 (low) to 5 (high):");
  lines.push("- timeSavings: how much time AI assistance would plausibly save on this specific task.");
  lines.push("- complexity: how complex or nuanced the task is (higher = needs more careful review of AI output).");
  lines.push("- riskIfWrong: how costly an error in the output would be (consider the stated audience).");
  lines.push("- dataSensitivity: how likely the task involves confidential, regulated, or personal data.");
  lines.push("- humanJudgment: how much specialized human judgment, discretion, or context this needs.");
  lines.push("");
  lines.push(
    'Verdict: "recommended" if AI is a good, low-risk fit; "caution" if AI can help but risk/sensitivity/' +
      'judgment mean it needs careful review; "not-recommended" if the task involves highly sensitive data ' +
      "or the combination of high risk and high judgment needed makes unsupervised AI use unwise.",
  );
  lines.push(
    'Human review status: "Yes" if a colleague must review before use, "No" if a light self-check ' +
      'suffices, "Conditional" if it depends on specifics worth flagging.',
  );
  lines.push("");
  lines.push("Task description:");
  lines.push(input.description.trim());
  if (input.taskType) lines.push(`Task type: ${input.taskType}`);
  if (input.sensitiveData) lines.push(`Involves personal/confidential data (self-reported): ${input.sensitiveData}`);
  if (input.audience) lines.push(`Audience of the output: ${input.audience}`);
  if (input.deadline) lines.push(`Deadline pressure: ${input.deadline}`);
  lines.push("");
  lines.push("Available tools to rank (JSON):");
  lines.push(
    JSON.stringify(
      tools.map((t) => ({
        id: t.id,
        name: t.name,
        universityProvided: t.universityProvided,
        shortDescription: t.shortDescription,
        bestFor: t.bestFor,
        strengths: t.strengths,
        limitations: t.limitations,
        relatedPlaybookTags: t.relatedPlaybookTags,
      })),
    ),
  );
  lines.push("");
  lines.push(
    "Rank every tool listed above, best fit first, with a fitReason that references specifics of " +
      "the task — not a generic description of the tool. Prefer university-provided tools when fit is " +
      "otherwise similar, since they carry stronger data protections.",
  );
  lines.push("");
  lines.push(
    "Respond with ONLY a single JSON object — no markdown code fences, no commentary before or " +
      "after — matching exactly this shape:",
  );
  lines.push(JSON.stringify(RESPONSE_SHAPE));
  return lines.join("\n");
}
