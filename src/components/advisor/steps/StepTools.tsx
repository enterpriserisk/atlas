"use client";

import { Button, Badge, NonUniversityToolBadge } from "@/components/ui";
import type { ToolRecommendation } from "@/lib/advisor/types";

/**
 * Step 3 — Tool Options. Comparison cards with pros/cons and a "why this fits your task"
 * line tied to Step 1. User selects one (or none) to continue.
 */
export function StepTools({
  recommendations,
  selectedToolId,
  onSelect,
  onBack,
  onNext,
}: {
  recommendations: ToolRecommendation[];
  selectedToolId: string | null;
  onSelect: (id: string | null) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-um-blue">Which tool fits best?</h2>
      <p className="mt-2 text-um-black-metallic">
        Ranked for your task. Select one to build a ready-to-use prompt, or continue without
        selecting to just take the summary.
      </p>

      <fieldset className="mt-6">
        <legend className="sr-only">Choose an AI tool</legend>
        <ul className="grid gap-4 md:grid-cols-2">
          {recommendations.map(({ tool, fitReason }, i) => {
            const selected = selectedToolId === tool.id;
            return (
              <li key={tool.id}>
                <label
                  className={`block h-full cursor-pointer rounded-lg border-2 p-4 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-um-blue ${
                    selected
                      ? "border-um-blue bg-[#eef3f9]"
                      : "border-border-subtle bg-white hover:bg-surface-muted"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="tool"
                        value={tool.id}
                        checked={selected}
                        onChange={() => onSelect(tool.id)}
                        aria-label={tool.name}
                        className="h-4 w-4 accent-um-blue"
                      />
                      <span className="text-lg font-bold text-um-blue">{tool.name}</span>
                    </div>
                    {i === 0 && (
                      <Badge tone="maize" glyph="★">
                        Best fit
                      </Badge>
                    )}
                  </div>

                  {tool.universityProvided ? (
                    <Badge tone="success" className="mt-2">
                      {tool.label}
                    </Badge>
                  ) : (
                    <div className="mt-2">
                      <NonUniversityToolBadge />
                    </div>
                  )}

                  <p className="mt-3 text-sm font-medium text-um-black-metallic">
                    Why this fits: <span className="font-normal">{fitReason}</span>
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-um-blue">Strengths: </span>
                      <span className="text-um-black-metallic">
                        {tool.strengths.slice(0, 2).join("; ")}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-um-blue">Limitations: </span>
                      <span className="text-um-black-metallic">
                        {tool.limitations.slice(0, 2).join("; ")}
                      </span>
                    </div>
                  </div>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onNext} size="lg">
          Continue →
        </Button>
      </div>
    </div>
  );
}
