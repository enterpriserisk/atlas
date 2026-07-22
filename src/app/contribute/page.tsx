import type { Metadata } from "next";
import { PageHeader, Card, CardBody } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "How to add to ATLAS — the living resource. A plain-language guide for staff and interns to add playbook entries and update content without writing code.",
};

/**
 * Contribute — explains, in plain language, how future staff/interns extend ATLAS by
 * editing the /content directory. Mirrors CONTRIBUTING.md so the promise is actionable.
 */

const CONTENT_MAP = [
  {
    path: "content/playbook/*.mdx",
    what: "One file per guidance entry. Copy TEMPLATE.mdx, fill in the top fields, write the body in Markdown.",
  },
  {
    path: "content/tools.json",
    what: "The tool directory (U-M GPT, Maizey, Gemini, and any additions). Keep approval status current.",
  },
  { path: "content/glossary.json", what: "Plain-language definitions of AI terms." },
  { path: "content/dos-donts.json", what: "The eight Do's & Don'ts sections." },
];

const STEPS = [
  "Duplicate content/TEMPLATE.mdx into the content/playbook folder.",
  "Rename it to describe your entry, using dashes (e.g., writing-meeting-recaps.mdx). The file name becomes the page's web address.",
  "Fill in the fields between the --- lines at the top (title, category, tags, review requirement, date, author, summary).",
  "Write the body using normal Markdown headings and bullet lists.",
  "Keep draft: true until it's reviewed; set it to false to publish. Search and listings update automatically.",
];

export default function ContributePage() {
  return (
    <>
      <PageHeader
        eyebrow="Living resource"
        title="Contribute to ATLAS"
        description="ATLAS is meant to grow. Most content lives in simple Markdown and JSON files you can add to without touching any application code — and you don't need to be a developer."
      />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6">
        <section aria-labelledby="add-entry-heading">
          <h2 id="add-entry-heading" className="text-2xl font-bold text-um-blue">
            Add a new Playbook entry
          </h2>
          <ol className="mt-4 space-y-3">
            {STEPS.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-um-blue text-sm font-bold text-white"
                >
                  {i + 1}
                </span>
                <span className="pt-0.5 text-um-black-metallic">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="where-heading">
          <h2 id="where-heading" className="text-2xl font-bold text-um-blue">
            Where content lives
          </h2>
          <p className="mt-2 text-um-black-metallic">
            Everything below is in the project&apos;s <code className="rounded bg-surface-muted px-1.5 py-0.5 text-sm">content/</code> folder:
          </p>
          <ul className="mt-4 space-y-3">
            {CONTENT_MAP.map((c) => (
              <li key={c.path}>
                <Card>
                  <CardBody className="py-4">
                    <code className="text-sm font-semibold text-um-arboretum-blue">{c.path}</code>
                    <p className="mt-1 text-sm text-um-black-metallic">{c.what}</p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tips-heading" className="rounded-lg border border-border-subtle bg-surface-muted p-5">
          <h2 id="tips-heading" className="text-lg font-bold text-um-blue">
            A few tips
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-um-black-metallic">
            <li>Keep JSON valid — quotes around text, commas between items (not after the last one).</li>
            <li>Dates use the format YYYY-MM-DD (e.g., 2026-01-15).</li>
            <li>When in doubt, copy an existing file and edit it rather than starting from scratch.</li>
            <li>
              The full guide is in the project&apos;s <code className="rounded bg-white px-1.5 py-0.5">CONTRIBUTING.md</code> file.
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
