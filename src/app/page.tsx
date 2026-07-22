import Link from "next/link";
import { primaryNav } from "@/lib/navigation";

/**
 * Placeholder home page — verifies Phase 1 theme/layout/fonts.
 * The full hero + featured-content home is built in Phase 8.
 */
export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-um-arboretum-blue">
        University of Michigan · Enterprise Risk Office
      </p>
      <h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-tight text-um-blue sm:text-5xl">
        Use AI effectively, consistently, and responsibly.
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-um-black-metallic">
        ATLAS is a living playbook that helps ERO staff decide when AI fits a task, which tool to
        use, and how to use it well — with responsible-use standards built in.
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {primaryNav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block h-full rounded-lg border border-border-subtle bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
            >
              <span className="text-lg font-semibold text-um-blue">{item.label}</span>
              {item.description && (
                <span className="mt-1 block text-sm text-um-stone">{item.description}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-um-stone">
        Phase 1 scaffold — theme, fonts, and layout. Feature pages are built in subsequent phases.
      </p>
    </div>
  );
}
