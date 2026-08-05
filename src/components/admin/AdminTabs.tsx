"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

interface AdminTabsProps {
  keysPanel: React.ReactNode;
  contributionsPanel: React.ReactNode;
  pendingCount: number;
}

/** Lightweight client-side tab switcher between the Access Keys and Contributions admin
 * panels. Both panels are pre-rendered server-side (their data is already loaded) — this
 * just toggles which one is visible, no extra fetch on switch. */
export function AdminTabs({ keysPanel, contributionsPanel, pendingCount }: AdminTabsProps) {
  const [tab, setTab] = useState<"keys" | "contributions">("keys");

  return (
    <div>
      <div role="tablist" aria-label="Admin sections" className="flex gap-2 border-b border-border-subtle">
        <TabButton active={tab === "keys"} onClick={() => setTab("keys")}>
          Access Keys
        </TabButton>
        <TabButton active={tab === "contributions"} onClick={() => setTab("contributions")}>
          Contributions
          {pendingCount > 0 && (
            <span className="ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-um-maize px-1.5 text-xs font-semibold text-um-blue">
              {pendingCount}
            </span>
          )}
        </TabButton>
      </div>
      <div className="mt-6">
        <div role="tabpanel" hidden={tab !== "keys"}>
          {keysPanel}
        </div>
        <div role="tabpanel" hidden={tab !== "contributions"}>
          {contributionsPanel}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "-mb-px flex items-center border-b-2 px-3 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue",
        active
          ? "border-um-blue text-um-blue"
          : "border-transparent text-um-stone hover:text-um-black-metallic",
      )}
    >
      {children}
    </button>
  );
}
