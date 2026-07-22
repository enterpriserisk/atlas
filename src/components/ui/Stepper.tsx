import { cn } from "@/lib/cn";

/**
 * Stepper — horizontal (desktop) / vertical (mobile) progress indicator for the
 * 6-step Advisor flow. Completed steps show a ✓, the current step is highlighted and
 * marked aria-current, upcoming steps show their number. State is conveyed by shape/icon
 * as well as color so it never relies on color alone.
 */

export interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  /** Zero-based index of the current step. */
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
        {steps.map((step, i) => {
          const completed = i < current;
          const active = i === current;
          const state = completed ? "complete" : active ? "current" : "upcoming";
          return (
            <li key={step.id} className="flex items-center sm:flex-1">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                    state === "complete" && "border-um-blue bg-um-blue text-white",
                    state === "current" && "border-um-blue bg-white text-um-blue ring-2 ring-um-maize",
                    state === "upcoming" && "border-border-subtle bg-white text-um-stone",
                  )}
                >
                  {completed ? "✓" : i + 1}
                </span>
                <span
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "text-sm",
                    active ? "font-semibold text-um-blue" : "text-um-stone",
                  )}
                >
                  {step.label}
                  <span className="sr-only">
                    {completed ? " (completed)" : active ? " (current step)" : " (upcoming)"}
                  </span>
                </span>
              </div>
              {/* Connector line (between steps, desktop only) */}
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mx-3 hidden h-0.5 flex-1 rounded sm:block",
                    completed ? "bg-um-blue" : "bg-border-subtle",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
