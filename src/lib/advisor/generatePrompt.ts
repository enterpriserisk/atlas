import type { Tool } from "@/lib/content/types";
import type { Assessment, TaskInput } from "./types";

/**
 * generatePrompt — builds a ready-to-use prompt, step-by-step instructions, and a
 * human-review checklist for the chosen tool from everything gathered in the wizard.
 *
 * v1 is DETERMINISTIC and template-based (no API key, no cost, fully auditable).
 *
 * ============================ LLM EXTENSION POINT ============================
 * To later have an LLM draft a more polished prompt, add an async sibling —
 * e.g. `generatePromptWithLLM(args)` — that sends `args` to an approved model and
 * returns the same PromptOutput shape. Keep THIS function as the default/fallback so
 * ATLAS works with no external dependency. Do not wire a live API into v1.
 * ============================================================================
 */

/** Answers to the Step 5 refinement questions, keyed by question id. */
export type RefinementAnswers = Record<string, string>;

export interface RefinementQuestion {
  id: string;
  label: string;
  placeholder?: string;
  /** "text" = free text; "choice" = pick one of options. */
  kind: "text" | "choice";
  options?: string[];
}

/**
 * Refinement questions shown in Step 5. Kept small (3–5) and task-aware.
 * Editable to tune the wizard without touching the components.
 */
export function getRefinementQuestions(input: TaskInput): RefinementQuestion[] {
  const questions: RefinementQuestion[] = [
    {
      id: "format",
      label: "What output format do you want?",
      kind: "choice",
      options: ["Bulleted list", "Short paragraphs", "Formal document", "Email", "Table"],
    },
    {
      id: "tone",
      label: "What tone should it have?",
      kind: "choice",
      options: ["Neutral / professional", "Friendly", "Formal", "Concise / plain"],
    },
    {
      id: "length",
      label: "About how long should it be?",
      kind: "choice",
      options: ["Very brief", "About half a page", "One page", "As long as needed"],
    },
    {
      id: "sources",
      label: "What source material should it use? (paste references or describe)",
      kind: "text",
      placeholder: "e.g., the attached policy; last week's meeting notes",
    },
  ];

  // Add an audience question when it wasn't specified up front.
  if (!input.audience) {
    questions.push({
      id: "audience",
      label: "Who is the audience?",
      kind: "choice",
      options: ["My team", "Leadership", "External partners", "General public"],
    });
  }
  return questions;
}

export interface PromptOutput {
  prompt: string;
  instructions: string[];
  checklist: string[];
}

export function generatePrompt(args: {
  input: TaskInput;
  assessment: Assessment;
  tool: Tool;
  answers: RefinementAnswers;
}): PromptOutput {
  const { input, assessment, tool, answers } = args;

  const format = answers.format ?? "clear, well-organized";
  const tone = answers.tone ?? "neutral and professional";
  const length = answers.length ?? "an appropriate length";
  const sources = answers.sources?.trim();
  const audience = answers.audience ?? input.audience ?? "the intended reader";

  // --- Build the refined prompt (template-based) ---------------------------
  const lines: string[] = [];
  lines.push(`You are helping a University of Michigan Enterprise Risk Office staff member.`);
  lines.push("");
  lines.push(`Task: ${input.description.trim()}`);
  lines.push("");
  lines.push(`Requirements:`);
  lines.push(`- Audience: ${audience}`);
  lines.push(`- Format: ${format}`);
  lines.push(`- Tone: ${tone}`);
  lines.push(`- Length: ${length}`);
  if (sources) {
    lines.push(`- Base your response on the following source material, and do not invent facts beyond it:`);
    lines.push(`"""`);
    lines.push(sources);
    lines.push(`"""`);
  } else {
    lines.push(`- Do not invent facts, figures, names, or citations. If you are unsure, say so.`);
  }
  lines.push("");
  lines.push(`Please produce a draft I will review and edit before use.`);
  const prompt = lines.join("\n");

  // --- Step-by-step usage instructions, tailored to the tool ---------------
  const instructions = [
    `Open ${tool.name}. ${tool.accessPath}`,
    `Copy the prompt below and paste it into ${tool.name}.`,
    sources
      ? `Confirm your source material is included (and contains no data the tool isn't approved for).`
      : `Add any specific source material you want it to use — and nothing the tool isn't approved for.`,
    `Review the output against the checklist before using or sharing it.`,
  ];

  // --- Human-review checklist, auto-generated from the assessment ----------
  const checklist: string[] = [
    "Verify all facts, figures, names, and dates against authoritative sources.",
    "Confirm any citations or references actually exist and say what's claimed.",
    "Edit the draft into your own voice; don't ship it verbatim.",
  ];
  const sensitivity = assessment.axes.find((a) => a.dimension === "dataSensitivity")?.score ?? 1;
  if (sensitivity >= 3 || input.sensitiveData === "yes" || input.sensitiveData === "unsure") {
    checklist.unshift(
      "Confirm you did NOT paste confidential, personal, or regulated data into the tool.",
    );
  }
  if (assessment.humanReview.status !== "No") {
    checklist.push(
      `Have a colleague review before sending (${assessment.humanReview.reason}).`,
    );
  }
  if (!tool.universityProvided) {
    checklist.unshift(
      "This is not a University-provided tool — verify its data-handling and approval status first.",
    );
  }

  return { prompt, instructions, checklist };
}
