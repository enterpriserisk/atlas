import type { Tool } from "@/lib/content/types";
import type { Assessment, TaskInput } from "./types";

/**
 * recommendTools — ranks available tools for a task, deterministically.
 *
 * Reads the tool list from content/tools.json (passed in, so this stays pure/testable).
 * Produces a "why this fits your task" line tied back to the Step 1 input for each tool.
 * Non-university tools are still returnable but the UI attaches the required warning.
 */

export interface ToolRecommendation {
  tool: Tool;
  /** Higher = better fit. */
  score: number;
  fitReason: string;
}

export function recommendTools(
  tools: Tool[],
  input: TaskInput,
  assessment: Assessment,
): ToolRecommendation[] {
  const text = (input.description || "").toLowerCase();
  const sensitivity = assessment.axes.find((a) => a.dimension === "dataSensitivity")?.score ?? 1;

  const recs = tools.map((tool) => {
    let score = 0;
    const reasons: string[] = [];

    // University-provided tools are preferred for work tasks.
    if (tool.universityProvided) {
      score += 3;
    } else {
      score -= 1;
    }

    // Tag overlap between the task and the tool's related guidance.
    const tagHits = tool.relatedPlaybookTags.filter(
      (tag) => text.includes(tag) || input.taskType === tag,
    ).length;
    score += tagHits * 2;
    if (tagHits > 0) reasons.push("matches the kind of work you described");

    // Maizey is a strong fit when grounding in your own documents matters
    // (research/summarization of a defined source set).
    if (tool.id === "um-maizey" && /document|report|policy|source|summar|research/.test(text)) {
      score += 2;
      reasons.push("grounds answers in your own documents, reducing hallucination");
    }

    // General drafting/summarizing -> U-M GPT is a solid default.
    if (tool.id === "um-gpt" && /draft|write|email|summar|brainstorm|rewrite/.test(text)) {
      score += 2;
      reasons.push("well-suited to general drafting and summarizing");
    }

    // If data is sensitive, nudge toward university-provided tools with protections.
    if (sensitivity >= 4 && tool.universityProvided) {
      score += 1;
      reasons.push("university-provided data protections matter given the sensitivity here");
    }

    const fitReason =
      reasons.length > 0
        ? capitalize(reasons.join("; ")) + "."
        : `A general-purpose option for "${truncate(input.description, 60)}".`;

    return { tool, score, fitReason };
  });

  return recs.sort((a, b) => b.score - a.score);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function truncate(s: string, n: number): string {
  const t = (s || "").trim();
  return t.length > n ? `${t.slice(0, n)}…` : t || "your task";
}
