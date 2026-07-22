"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Stepper, AiAssistedNotice } from "@/components/ui";
import type { Step } from "@/components/ui";
import type { Tool } from "@/lib/content/types";
import { scoreTask } from "@/lib/advisor/scoreTask";
import { recommendTools } from "@/lib/advisor/recommendTools";
import {
  generatePrompt,
  getRefinementQuestions,
  type RefinementAnswers,
} from "@/lib/advisor/generatePrompt";
import type { TaskInput } from "@/lib/advisor/types";
import { StepIntake } from "./steps/StepIntake";
import { StepAssessment } from "./steps/StepAssessment";
import { StepTools } from "./steps/StepTools";
import { StepContinue } from "./steps/StepContinue";
import { StepRefine } from "./steps/StepRefine";
import { StepResult } from "./steps/StepResult";

/**
 * AdvisorWizard — the 6-step AI Task Advisor.
 * Holds all wizard state, runs the deterministic engine, and renders the current step
 * with animated transitions (respecting prefers-reduced-motion). The engine functions are
 * pure; this component only orchestrates the flow.
 */

const STEPS: Step[] = [
  { id: "intake", label: "Task" },
  { id: "assessment", label: "Assessment" },
  { id: "tools", label: "Tools" },
  { id: "continue", label: "Continue" },
  { id: "refine", label: "Refine" },
  { id: "result", label: "Prompt" },
];

export function AdvisorWizard({ tools }: { tools: Tool[] }) {
  const reduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);

  const [input, setInput] = useState<TaskInput>({ description: "" });
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<RefinementAnswers>({});

  // Derived engine outputs — recomputed from inputs (deterministic, cheap).
  const assessment = useMemo(
    () => (input.description.trim() ? scoreTask(input) : null),
    [input],
  );
  const recommendations = useMemo(
    () => (assessment ? recommendTools(tools, input, assessment) : []),
    [tools, input, assessment],
  );
  const selectedTool = tools.find((t) => t.id === selectedToolId) ?? null;
  const questions = useMemo(() => getRefinementQuestions(input), [input]);
  const promptOutput = useMemo(
    () =>
      assessment && selectedTool
        ? generatePrompt({ input, assessment, tool: selectedTool, answers })
        : null,
    [assessment, selectedTool, input, answers],
  );

  const stepRegionRef = useRef<HTMLDivElement>(null);
  // Skip focus-move on the very first render; only move focus on actual step changes.
  const mounted = useRef(false);

  function go(to: number) {
    setStepIndex(Math.max(0, Math.min(STEPS.length - 1, to)));
  }

  // After the new step mounts, move focus to the step region so keyboard and screen-reader
  // users land on the new content (not stranded on an unmounted button or at <body>).
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const region = stepRegionRef.current;
    if (region) {
      region.focus({ preventScroll: true });
      region.scrollIntoView({ block: "start" });
    }
  }, [stepIndex]);

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: "easeInOut" as const };

  return (
    <div>
      <Stepper steps={STEPS} current={stepIndex} className="mb-8" />

      {/* Small, dedicated status announcer — narrates just the step change, not the whole subtree. */}
      <p className="sr-only" role="status">
        {`Step ${stepIndex + 1} of ${STEPS.length}: ${STEPS[stepIndex].label}`}
      </p>

      <div
        ref={stepRegionRef}
        id="advisor-step-region"
        tabIndex={-1}
        role="group"
        aria-label={`Step ${stepIndex + 1} of ${STEPS.length}: ${STEPS[stepIndex].label}`}
        className="scroll-mt-24 focus:outline-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduceMotion ? 0 : -16 }}
            transition={transition}
          >
            {stepIndex === 0 && (
              <StepIntake
                input={input}
                onChange={setInput}
                onNext={() => go(1)}
              />
            )}

            {stepIndex === 1 && assessment && (
              <StepAssessment
                assessment={assessment}
                onBack={() => go(0)}
                onNext={() =>
                  // Skip the tool step entirely if AI is not recommended.
                  assessment.verdict === "not-recommended" ? go(3) : go(2)
                }
              />
            )}

            {stepIndex === 2 && assessment && (
              <StepTools
                recommendations={recommendations}
                selectedToolId={selectedToolId}
                onSelect={setSelectedToolId}
                onBack={() => go(1)}
                onNext={() => go(3)}
              />
            )}

            {stepIndex === 3 && assessment && (
              <StepContinue
                assessment={assessment}
                input={input}
                selectedTool={selectedTool}
                onBack={() => go(assessment.verdict === "not-recommended" ? 1 : 2)}
                onContinue={() => go(4)}
              />
            )}

            {stepIndex === 4 && (
              <StepRefine
                questions={questions}
                answers={answers}
                onChange={setAnswers}
                onBack={() => go(3)}
                onNext={() => go(5)}
              />
            )}

            {stepIndex === 5 && promptOutput && selectedTool && assessment && (
              <StepResult
                input={input}
                assessment={assessment}
                tool={selectedTool}
                output={promptOutput}
                onBack={() => go(4)}
                onRestart={() => {
                  setInput({ description: "" });
                  setSelectedToolId(null);
                  setAnswers({});
                  go(0);
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8">
        <AiAssistedNotice variant="banner" />
      </div>
    </div>
  );
}
