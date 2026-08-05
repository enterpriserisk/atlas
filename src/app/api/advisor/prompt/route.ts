import { NextResponse } from "next/server";
import { callGroqJSON, isGroqError } from "@/lib/advisor/groq";
import type { RefinementAnswers, PromptOutput } from "@/lib/advisor/generatePrompt";
import type { Assessment, TaskInput } from "@/lib/advisor/types";
import type { Tool } from "@/lib/content/types";

/**
 * POST /api/advisor/prompt — the AI Task Advisor's Step 6. Takes everything gathered in
 * the wizard and asks the model (via Groq) to draft the actual ready-to-use prompt,
 * tool-specific usage instructions, and a human-review checklist. Server-only: the only
 * other place besides /api/advisor/assess that reads GROQ_API_KEY.
 */

interface RequestBody {
  input: TaskInput;
  assessment: Assessment;
  tool: Tool;
  answers: RefinementAnswers;
}

// See the comment in api/advisor/assess/route.ts — json_object mode, parsed defensively.
const RESPONSE_SHAPE = {
  type: "object",
  properties: {
    prompt: {
      type: "string",
      description: "The full, ready-to-paste prompt text for the chosen tool, incorporating the task and all refinement answers.",
    },
    instructions: {
      type: "array",
      description: "3 to 6 numbered step-by-step instructions for actually using the prompt with this tool.",
      items: { type: "string" },
    },
    checklist: {
      type: "array",
      description: "2 to 6 human-review checklist items tailored to this task's flagged risks.",
      items: { type: "string" },
    },
  },
  required: ["prompt", "instructions", "checklist"],
} as const;

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body?.input?.description || !body?.tool) {
    return NextResponse.json({ error: "Missing task input or selected tool." }, { status: 400 });
  }

  let raw: PromptOutput;
  try {
    raw = await callGroqJSON<PromptOutput>({ input: buildPrompt(body) });
  } catch (err) {
    const message = isGroqError(err) ? err.message : "Unexpected error calling the AI model.";
    const status = isGroqError(err) && err.status ? err.status : 502;
    return NextResponse.json({ error: message }, { status });
  }

  // Same caveat as the assess route: json_object mode doesn't guarantee every field is
  // present or well-typed, so normalize defensively rather than trusting the shape.
  if (typeof raw?.prompt !== "string" || !raw.prompt.trim()) {
    return NextResponse.json({ error: "The AI model did not return a usable prompt. Please try again." }, { status: 502 });
  }
  const result: PromptOutput = {
    prompt: raw.prompt,
    instructions: Array.isArray(raw.instructions)
      ? raw.instructions.filter((i): i is string => typeof i === "string")
      : [],
    checklist: Array.isArray(raw.checklist) ? raw.checklist.filter((c): c is string => typeof c === "string") : [],
  };

  const checklist = [...result.checklist];
  const sensitivity = body.assessment.axes.find((a) => a.dimension === "dataSensitivity")?.score ?? 1;
  const mentionsConfidential = checklist.some((c) => /confidential|sensitive|personal|regulated/i.test(c));
  const mentionsUniversity = checklist.some((c) => /university.?provided|approval status/i.test(c));

  if ((sensitivity >= 3 || body.assessment.humanReview.status !== "No") && !mentionsConfidential) {
    checklist.unshift(
      "Confirm you did NOT paste confidential, personal, or regulated data into the tool.",
    );
  }
  if (!body.tool.universityProvided && !mentionsUniversity) {
    checklist.unshift(
      "This is not a University-provided tool — verify its data-handling and approval status first.",
    );
  }

  return NextResponse.json({ prompt: result.prompt, instructions: result.instructions, checklist });
}

function buildPrompt(body: RequestBody): string {
  const { input, assessment, tool, answers } = body;
  const lines: string[] = [];
  lines.push(
    "You are drafting the final output of ATLAS, an AI-use advisor for University of Michigan " +
      "Enterprise Strategic Risk Management staff. The staff member has already been assessed and chosen a tool; " +
      "your job is to write the actual ready-to-use prompt for that tool, tailored usage instructions, " +
      "and a human-review checklist. Be concrete and specific to this task, not generic.",
  );
  lines.push("");
  lines.push(`Task: ${input.description.trim()}`);
  lines.push(`Chosen tool: ${tool.name} (${tool.universityProvided ? "university-provided" : "NOT university-provided"})`);
  lines.push(`How this tool is accessed: ${tool.accessPath}`);
  lines.push("");
  lines.push("Refinement answers from the staff member:");
  lines.push(`- Format: ${answers.format ?? "no preference — pick something sensible"}`);
  lines.push(`- Tone: ${answers.tone ?? "no preference — neutral and professional"}`);
  lines.push(`- Length: ${answers.length ?? "no preference — an appropriate length"}`);
  lines.push(`- Audience: ${answers.audience ?? input.audience ?? "not specified"}`);
  if (answers.sources?.trim()) {
    lines.push(`- Source material to reference: ${answers.sources.trim()}`);
  } else {
    lines.push("- No source material was provided — the prompt should instruct the tool not to invent facts.");
  }
  lines.push("");
  lines.push("Assessment flags to account for in the checklist:");
  lines.push(`- Verdict: ${assessment.verdict}`);
  lines.push(`- Human review required: ${assessment.humanReview.status} (${assessment.humanReview.reason})`);
  for (const a of assessment.axes) lines.push(`- ${a.label}: ${a.score}/5 — ${a.reason}`);
  lines.push("");
  lines.push(
    "Write: (1) the full prompt text ready to paste into the tool, ending with an instruction that the " +
      "output is a draft for human review; (2) 3-6 step-by-step instructions for using it with THIS tool " +
      "specifically (reference how it's accessed); (3) a human-review checklist grounded in the flags above.",
  );
  lines.push("");
  lines.push(
    "Respond with ONLY a single JSON object — no markdown code fences, no commentary before or " +
      "after — matching exactly this shape:",
  );
  lines.push(JSON.stringify(RESPONSE_SHAPE));
  return lines.join("\n");
}
