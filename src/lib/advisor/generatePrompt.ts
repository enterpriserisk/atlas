import type { TaskInput } from "./types";

/**
 * Static, non-AI parts of Step 5/6 of the AI Task Advisor wizard.
 *
 * The actual prompt/instructions/checklist generation is done by an AI model via
 * POST /api/advisor/prompt (see src/app/api/advisor/prompt/route.ts) — this file only
 * keeps the fixed set of refinement questions (cheap, static UI config, no AI needed)
 * and the shared `PromptOutput` shape both the API route and the UI components use.
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
