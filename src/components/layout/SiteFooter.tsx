import Link from "next/link";
import { primaryNav, secondaryNav } from "@/lib/navigation";

/**
 * Site footer: Michigan Blue chrome, wordmark byline, grouped navigation, and a
 * transparency note that ATLAS provides AI-use guidance requiring human judgment.
 */
export function SiteFooter() {
  const allNav = [...primaryNav, ...secondaryNav];

  return (
    <footer className="mt-auto bg-um-blue text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <span
              className="text-xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ATLAS
            </span>
            <p className="mt-1 text-sm text-um-maize">
              Actionable Tooling, Libraries, Automation &amp; Standards
            </p>
            <p className="mt-3 max-w-xs text-sm text-white/80">
              A living resource from the University of Michigan Enterprise Risk Office to help
              staff use AI effectively, consistently, and responsibly.
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-2">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
              {allNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/90 underline-offset-4 hover:text-um-maize hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-maize"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 border-t border-white/15 pt-6 text-xs text-white/70">
          <p>
            ATLAS provides AI-use guidance that requires human judgment. Recommendations are
            decision support, not approvals — always verify against current U-M policy and
            confirm tool approval status before use.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} University of Michigan Enterprise Risk Office. Internal
            tool — not an official University marketing site.
          </p>
        </div>
      </div>
    </footer>
  );
}
