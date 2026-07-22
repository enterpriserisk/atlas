"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { primaryNav } from "@/lib/navigation";
import { AccessibilityMenu } from "@/components/accessibility/AccessibilityMenu";

/**
 * Site header: Michigan Blue chrome with a text wordmark (NO Block M / Seal per brand
 * trademark rules), primary nav with maize active-state underline, accessibility menu,
 * and a responsive mobile menu.
 */

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-um-blue text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Wordmark */}
        <Link
          href="/"
          className="group flex flex-col leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-maize"
        >
          <span
            className="text-2xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            ATLAS
          </span>
          <span className="mt-0.5 text-[0.7rem] font-medium uppercase tracking-wide text-um-maize">
            University of Michigan · Enterprise Risk Office
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-maize ${
                      active ? "text-um-maize" : "text-white"
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-um-maize"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <AccessibilityMenu />
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-white/25 p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-maize lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span aria-hidden="true" className="text-lg leading-none">
              {mobileOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="border-t border-white/15 lg:hidden"
        >
          <ul className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-maize ${
                      active ? "text-um-maize" : "text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
