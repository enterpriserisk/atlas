"use client";

import { Button, ProgressBar } from "@/components/ui";
import type { RefinementAnswers, RefinementQuestion } from "@/lib/advisor/generatePrompt";

/**
 * Step 5 — Refinement Intake. A short set of targeted follow-ups (3–5) with a progress bar
 * so it feels finite and quick. All optional; sensible defaults apply if skipped.
 */
export function StepRefine({
  questions,
  answers,
  onChange,
  onBack,
  onNext,
}: {
  questions: RefinementQuestion[];
  answers: RefinementAnswers;
  onChange: (answers: RefinementAnswers) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const answeredCount = questions.filter((q) => (answers[q.id] ?? "").trim().length > 0).length;

  function set(id: string, value: string) {
    onChange({ ...answers, [id]: value });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-um-blue">A few quick details</h2>
      <p className="mt-2 text-um-black-metallic">
        These fine-tune your prompt. All optional — skip any and ATLAS will use sensible defaults.
      </p>

      <div className="mt-4">
        <ProgressBar
          value={answeredCount}
          max={questions.length}
          label={`${answeredCount} of ${questions.length} answered`}
        />
      </div>

      <div className="mt-6 space-y-5">
        {questions.map((q) => (
          <div key={q.id}>
            <label htmlFor={`q-${q.id}`} className="mb-1 block text-sm font-medium text-um-black-metallic">
              {q.label}
            </label>
            {q.kind === "choice" && q.options ? (
              <select
                id={`q-${q.id}`}
                value={answers[q.id] ?? ""}
                onChange={(e) => set(q.id, e.target.value)}
                className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
              >
                <option value="">No preference</option>
                {q.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <textarea
                id={`q-${q.id}`}
                value={answers[q.id] ?? ""}
                onChange={(e) => set(q.id, e.target.value)}
                rows={3}
                placeholder={q.placeholder}
                className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onNext} size="lg">
          Generate my prompt →
        </Button>
      </div>
    </div>
  );
}
