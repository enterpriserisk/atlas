"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Badge, Card, CardBody, NonUniversityToolBadge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Tool } from "@/lib/content/types";

/**
 * ToolCard — reference card for one AI tool.
 * If the tool is NOT university-provided, the non-University warning banner renders
 * automatically (driven by the `universityProvided` flag in tools.json) so the caveat
 * can never be forgotten — and it stays visible whether or not the card is expanded.
 *
 * Full details (approved uses, strengths, limitations, data sensitivity, access path)
 * are collapsed by default behind a "Show details" toggle, so a directory of many tools
 * stays scannable instead of becoming a wall of text.
 *
 * The card is anchored by its id so links like /tools#gemini scroll to it.
 */
export function ToolCard({ tool }: { tool: Tool }) {
  const [open, setOpen] = useState(false);
  const baseId = useId();
  const buttonId = `${baseId}-button`;
  const panelId = `${baseId}-panel`;

  return (
    <Card
      id={tool.id}
      accent={tool.universityProvided ? "bg-um-maize" : "bg-um-arboretum-blue"}
      className="scroll-mt-24"
    >
      <CardBody>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold text-um-blue">{tool.name}</h2>
          {tool.universityProvided ? (
            <Badge tone="success">{tool.label}</Badge>
          ) : (
            <Badge tone="info">External tool</Badge>
          )}
        </div>

        <p className="mt-2 leading-relaxed text-um-black-metallic">{tool.shortDescription}</p>

        <p className="mt-4 text-sm font-medium text-um-blue">Best for</p>
        <p className="text-sm text-um-black-metallic">{tool.bestFor}</p>

        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-um-arboretum-blue hover:text-um-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
        >
          <span
            aria-hidden="true"
            className={cn("inline-block transition-transform duration-200", open && "rotate-180")}
          >
            ▾
          </span>
          {open ? "Hide details" : "Show details"}
        </button>

        <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open} className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ToolList
              title={tool.universityProvided ? "Approved for" : "Typical uses"}
              items={tool.approvedFor}
            />
            <ToolList title="Strengths" items={tool.strengths} />
            <ToolList title="Limitations" items={tool.limitations} />
            <div>
              <p className="text-sm font-semibold text-um-blue">Data sensitivity</p>
              <p className="mt-1 text-sm text-um-black-metallic">{tool.dataSensitivityNote}</p>
            </div>
          </div>

          <div className="mt-4 rounded-md bg-surface-muted p-3">
            <p className="text-sm font-semibold text-um-blue">How to access</p>
            <p className="mt-1 text-sm text-um-black-metallic">{tool.accessPath}</p>
          </div>

          {!tool.universityProvided && (
            <div className="mt-4">
              <NonUniversityToolBadge variant="banner" />
            </div>
          )}

          {tool.relatedPlaybookTags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-um-stone">
                Related guidance:
              </span>
              {tool.relatedPlaybookTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/playbook?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-border-subtle px-2.5 py-0.5 text-xs font-medium text-um-arboretum-blue hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function ToolList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-um-blue">{title}</p>
      <ul className="mt-1 space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed text-um-black-metallic">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
