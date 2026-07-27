"use client";

import { useState } from "react";
import { Button, Spinner } from "@/components/ui";
import { TASK_TYPE_LABELS, type TaskInput, type TaskType } from "@/lib/advisor/types";

/**
 * Step 1 — Task Intake. One primary input (the description); everything else optional
 * and collapsed by default to keep it fast.
 */
export function StepIntake({
  input,
  onChange,
  onNext,
  loading,
  error,
}: {
  input: TaskInput;
  onChange: (input: TaskInput) => void;
  onNext: () => void;
  loading: boolean;
  error: string | null;
}) {
  const [showOptional, setShowOptional] = useState(
    Boolean(input.taskType || input.sensitiveData || input.audience || input.deadline),
  );
  const canProceed = input.description.trim().length >= 5;

  return (
    <div>
      <h2 className="text-2xl font-bold text-um-blue">Describe the task you&apos;re working on</h2>
      <p className="mt-2 text-um-black-metallic">
        In a sentence or two, tell ATLAS what you&apos;re trying to do. The more specific you are,
        the better the assessment.
      </p>
      <p className="mt-2 text-sm text-um-stone">
        This description is sent to Groq to power the assessment — don&apos;t include
        confidential, regulated, or personal information.
      </p>

      <label htmlFor="task-description" className="sr-only">
        Task description
      </label>
      <textarea
        id="task-description"
        value={input.description}
        onChange={(e) => onChange({ ...input, description: e.target.value })}
        rows={5}
        placeholder="e.g., Draft a summary of last week's risk committee meeting for my team."
        aria-describedby={canProceed ? undefined : "task-description-hint"}
        disabled={loading}
        className="mt-4 w-full rounded-lg border border-border-subtle bg-white px-4 py-3 text-base shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue disabled:opacity-60"
      />

      <button
        type="button"
        onClick={() => setShowOptional((s) => !s)}
        aria-expanded={showOptional}
        className="mt-4 text-sm font-medium text-um-arboretum-blue underline underline-offset-2 hover:text-um-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
      >
        {showOptional ? "Hide" : "Add"} optional details (improves the assessment)
      </button>

      {showOptional && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Task type">
            <select
              value={input.taskType ?? ""}
              onChange={(e) =>
                onChange({ ...input, taskType: (e.target.value || undefined) as TaskType | undefined })
              }
              className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
            >
              <option value="">Not sure</option>
              {(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((t) => (
                <option key={t} value={t}>
                  {TASK_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Does it involve personal or confidential data?">
            <select
              value={input.sensitiveData ?? ""}
              onChange={(e) =>
                onChange({
                  ...input,
                  sensitiveData: (e.target.value || undefined) as TaskInput["sensitiveData"],
                })
              }
              className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
            >
              <option value="">Not sure</option>
              <option value="no">No</option>
              <option value="unsure">Unsure</option>
              <option value="yes">Yes</option>
            </select>
          </Field>

          <Field label="Who is the audience?">
            <select
              value={input.audience ?? ""}
              onChange={(e) =>
                onChange({
                  ...input,
                  audience: (e.target.value || undefined) as TaskInput["audience"],
                })
              }
              className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
            >
              <option value="">Not specified</option>
              <option value="internal">Internal / my team</option>
              <option value="leadership">Leadership</option>
              <option value="external">External partners</option>
              <option value="public">General public</option>
            </select>
          </Field>

          <Field label="Deadline pressure">
            <select
              value={input.deadline ?? ""}
              onChange={(e) =>
                onChange({
                  ...input,
                  deadline: (e.target.value || undefined) as TaskInput["deadline"],
                })
              }
              className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
            >
              <option value="">Not specified</option>
              <option value="none">No rush</option>
              <option value="soon">Soon</option>
              <option value="urgent">Urgent</option>
            </select>
          </Field>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-um-tappan-red bg-[#f6e3e0] px-3 py-2 text-sm text-um-tappan-red"
        >
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-end">
        <Button onClick={onNext} disabled={!canProceed || loading} size="lg">
          {loading ? (
            <>
              <Spinner /> Assessing your task…
            </>
          ) : (
            "Assess this task →"
          )}
        </Button>
      </div>
      {!canProceed && !loading && (
        <p id="task-description-hint" className="mt-2 text-right text-xs text-um-stone">
          Enter a short description to continue.
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-um-black-metallic">{label}</span>
      {children}
    </label>
  );
}
