import Link from "next/link";
import { Badge, Button, Card, CardBody } from "@/components/ui";
import { getPlaybookEntries } from "@/lib/content/loaders";

/**
 * Home — hero explaining ATLAS, three primary entry points, and a "recently added"
 * strip (driven by real playbook content) to reinforce that ATLAS is a living resource.
 */

const ENTRY_POINTS = [
  {
    href: "/playbook",
    title: "Browse the Playbook",
    description: "Searchable guidance, tool write-ups, and standards for using AI at work.",
    cta: "Open the library",
  },
  {
    href: "/advisor",
    title: "Ask the AI Task Advisor",
    description:
      "Answer a few questions and get a transparent read on whether AI fits your task — plus a ready-to-use prompt.",
    cta: "Start an assessment",
  },
  {
    href: "/dos-and-donts",
    title: "View the Do's & Don'ts",
    description: "The responsible-use standards, at a glance — appropriate uses, review, and ethics.",
    cta: "See the standards",
  },
];

export default function Home() {
  const recent = getPlaybookEntries().slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-um-blue">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-um-maize">
            University of Michigan · Enterprise Risk Office
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Use AI effectively, consistently, and responsibly.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/90">
            ATLAS is a living playbook that helps ERO staff decide when AI fits a task, which tool
            to use, and how to use it well — with responsible-use standards built in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/advisor" variant="maize" size="lg">
              Try the AI Task Advisor
            </Button>
            <Button
              href="/playbook"
              size="lg"
              className="border border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              Browse the Playbook
            </Button>
          </div>
        </div>
      </section>

      {/* Three entry points */}
      <section aria-labelledby="entry-heading" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 id="entry-heading" className="sr-only">
          Where to start
        </h2>
        <ul className="grid gap-6 md:grid-cols-3">
          {ENTRY_POINTS.map((ep) => (
            <li key={ep.href}>
              <Card href={ep.href} accent="bg-um-maize" className="h-full">
                <CardBody className="flex h-full flex-col">
                  <h3 className="text-xl font-bold text-um-blue">{ep.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-um-black-metallic">
                    {ep.description}
                  </p>
                  <span className="mt-4 text-sm font-semibold text-um-arboretum-blue">
                    {ep.cta} →
                  </span>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* Recently added — reinforces "living resource" */}
      {recent.length > 0 && (
        <section aria-labelledby="recent-heading" className="border-t border-border-subtle bg-surface-muted">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 id="recent-heading" className="text-2xl font-bold text-um-blue">
                  Recently added
                </h2>
                <p className="mt-1 text-sm text-um-stone">
                  ATLAS grows as staff contribute. Here&apos;s the latest guidance.
                </p>
              </div>
              <Link
                href="/playbook"
                className="hidden text-sm font-semibold text-um-arboretum-blue underline underline-offset-2 hover:text-um-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue sm:block"
              >
                View all →
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-3">
              {recent.map((entry) => (
                <li key={entry.slug}>
                  <Card href={`/playbook/${entry.slug}`} className="h-full">
                    <CardBody className="flex h-full flex-col">
                      <Badge tone="blue" glyph={null}>
                        {entry.category}
                      </Badge>
                      <h3 className="mt-2 text-base font-semibold text-um-blue">{entry.title}</h3>
                      <p className="mt-1 flex-1 text-sm text-um-black-metallic">{entry.summary}</p>
                      {entry.lastUpdated && (
                        <span className="mt-3 text-xs text-um-stone">Updated {entry.lastUpdated}</span>
                      )}
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
