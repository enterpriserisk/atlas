"use client";

import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { AxisScore } from "@/lib/advisor/types";

/**
 * AssessmentRadar — the Step 2 spider chart of the five assessment dimensions.
 *
 * Accessibility: the chart is decorative-plus (aria-hidden) and is ALWAYS accompanied by
 * an equivalent data table. Users can toggle to the table view; screen-reader users get the
 * table regardless. Scores are shown as direct data labels (not color-only) per brand guide.
 * Uses Arboretum Blue fill + Maize outline (approved accessible data-viz colors).
 */
export function AssessmentRadar({ axes }: { axes: AxisScore[] }) {
  const [showTable, setShowTable] = useState(false);
  const reduceMotion = useReducedMotion();

  const data = axes.map((a) => ({ dimension: a.label, score: a.score }));

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowTable((s) => !s)}
          aria-pressed={showTable}
          className="mb-2 rounded-md border border-border-subtle px-3 py-1.5 text-sm font-medium text-um-blue hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
        >
          {showTable ? "Show chart" : "Show as table"}
        </button>
      </div>

      {!showTable ? (
        <>
          {/* Visual chart — hidden from assistive tech; the table below is the accessible equivalent. */}
          <div aria-hidden="true" className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} outerRadius="70%">
                <PolarGrid stroke="#d5dae0" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: "#131516", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  domain={[0, 5]}
                  tickCount={6}
                  tick={{ fill: "#80764b", fontSize: 11 }}
                  angle={90}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#FFCB05"
                  strokeWidth={2}
                  fill="#2F65A7"
                  fillOpacity={0.5}
                  isAnimationActive={!reduceMotion}
                  label={{ fill: "#00274C", fontSize: 12, fontWeight: 700 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs text-um-stone">
            Each axis is scored 1 (low) to 5 (high).
          </p>
        </>
      ) : null}

      {/* Data table — always present for screen readers; visually shown when toggled. */}
      <table className={showTable ? "w-full border-collapse text-sm" : "sr-only"}>
        <caption className="mb-2 text-left text-sm font-semibold text-um-blue">
          Assessment scores (1 = low, 5 = high)
        </caption>
        <thead>
          <tr>
            <th scope="col" className="border-b border-border-subtle py-2 text-left">
              Dimension
            </th>
            <th scope="col" className="border-b border-border-subtle py-2 text-left">
              Score (1–5)
            </th>
            <th scope="col" className="border-b border-border-subtle py-2 text-left">
              Why
            </th>
          </tr>
        </thead>
        <tbody>
          {axes.map((a) => (
            <tr key={a.dimension}>
              <th scope="row" className="border-b border-border-subtle py-2 text-left font-medium">
                {a.label}
              </th>
              <td className="border-b border-border-subtle py-2">{a.score}</td>
              <td className="border-b border-border-subtle py-2 text-um-black-metallic">
                {a.reason}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
