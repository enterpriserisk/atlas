import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, HumanReviewBadge, DraftTag } from "@/components/ui";
import { Markdown } from "@/components/content/Markdown";
import { getPlaybookEntries, getPlaybookEntry, getTool } from "@/lib/content/loaders";

/** Pre-render a static page for each static (.mdx-file) playbook entry at build time.
 * Dynamically-submitted entries aren't in this list — `dynamicParams` defaults to true, so
 * Next renders those on demand via the database fallback in getPlaybookEntry(). */
export function generateStaticParams() {
  return getPlaybookEntries().map((e) => ({ slug: e.slug }));
}

// Always check for a fresh dynamic (database) entry rather than caching a "not found" for
// a slug that didn't exist yet at build time, or serving stale content for one that did.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getPlaybookEntry(slug);
  if (!entry) return { title: "Entry not found" };
  return { title: entry.title, description: entry.summary };
}

export default async function PlaybookEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getPlaybookEntry(slug);
  if (!entry) notFound();

  const toolNames = entry.aiToolsReferenced
    .map((id) => getTool(id)?.name ?? id)
    .filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <Link
          href="/playbook"
          className="text-um-arboretum-blue underline underline-offset-2 hover:text-um-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
        >
          ← Back to Playbook
        </Link>
      </nav>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="blue" glyph={null}>
          {entry.category}
        </Badge>
        {entry.draft && <DraftTag />}
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-um-blue sm:text-4xl">
        {entry.title}
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-um-black-metallic">{entry.summary}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-y border-border-subtle py-3 text-sm text-um-stone">
        <HumanReviewBadge status={entry.humanReviewRequired} />
        {toolNames.length > 0 && (
          <span>
            Tools:{" "}
            <span className="font-medium text-um-black-metallic">{toolNames.join(", ")}</span>
          </span>
        )}
        {entry.lastUpdated && <span>Updated {entry.lastUpdated}</span>}
        {entry.author && <span>By {entry.author}</span>}
      </div>

      <div className="mt-8">
        <Markdown>{entry.body}</Markdown>
      </div>

      {entry.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-border-subtle pt-6">
          {entry.tags.map((tag) => (
            <Badge key={tag} tone="neutral" glyph={null}>
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
}
