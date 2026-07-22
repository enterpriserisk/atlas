import type { Metadata } from "next";
import { PageHeader, AiAssistedNotice } from "@/components/ui";
import { getPlaybookEntries, getDosDonts } from "@/lib/content/loaders";

export const metadata: Metadata = {
  title: "About ATLAS",
  description:
    "What ATLAS stands for, its purpose, ownership, and how it stays current — the U-M Enterprise Risk Office's living AI-use resource.",
};

const ACRONYM = [
  { letter: "A", word: "Actionable" },
  { letter: "T", word: "Tooling" },
  { letter: "L", word: "Libraries" },
  { letter: "A", word: "Automation &" },
  { letter: "S", word: "Standards" },
];

export default function AboutPage() {
  const entries = getPlaybookEntries();
  const dosDonts = getDosDonts();
  const lastPlaybookUpdate = entries[0]?.lastUpdated ?? "—";

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="About ATLAS"
        description="A living resource from the University of Michigan Enterprise Risk Office to help staff use AI effectively, consistently, and responsibly."
      />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6">
        <section aria-labelledby="acronym-heading">
          <h2 id="acronym-heading" className="text-2xl font-bold text-um-blue">
            What ATLAS stands for
          </h2>
          <ul className="mt-4 space-y-2">
            {ACRONYM.map((a, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-um-maize text-lg font-extrabold text-um-blue"
                >
                  {a.letter}
                </span>
                <span className="text-lg text-um-black-metallic">{a.word}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="purpose-heading">
          <h2 id="purpose-heading" className="text-2xl font-bold text-um-blue">
            Purpose
          </h2>
          <p className="mt-3 leading-relaxed text-um-black-metallic">
            ATLAS is a practical, searchable playbook for using AI in the day-to-day work of the
            Enterprise Risk Office. It helps staff decide <em>whether</em> AI is appropriate for a
            task, understand the <em>risks</em>, choose the right <em>tool</em>, and use it with a
            consistent set of responsible-use standards. It is designed to grow over time as staff
            and interns add guidance — without needing to be developers.
          </p>
        </section>

        <section aria-labelledby="ownership-heading">
          <h2 id="ownership-heading" className="text-2xl font-bold text-um-blue">
            Ownership
          </h2>
          <p className="mt-3 leading-relaxed text-um-black-metallic">
            ATLAS is owned and maintained by the University of Michigan Enterprise Risk Office. It
            is an internal tool — not an official University marketing site — and intentionally uses
            a text wordmark rather than the Block M or University Seal, per U-M brand trademark
            guidelines.
          </p>
          <div className="mt-4">
            <AiAssistedNotice
              variant="banner"
              message="ATLAS provides AI-use guidance requiring human judgment. Its recommendations are decision support, not approvals — verify against current U-M policy."
            />
          </div>
        </section>

        <section aria-labelledby="log-heading">
          <h2 id="log-heading" className="text-2xl font-bold text-um-blue">
            Last-updated log
          </h2>
          <dl className="mt-4 divide-y divide-border-subtle rounded-lg border border-border-subtle bg-white">
            <LogRow label="Playbook (most recent entry)" value={lastPlaybookUpdate} />
            <LogRow label="Playbook entries published" value={String(entries.length)} />
            <LogRow
              label="Do's & Don'ts reviewed by ERO"
              value={dosDonts.lastReviewedByERO ?? "Not yet reviewed (draft)"}
            />
          </dl>
          <p className="mt-3 text-sm text-um-stone">
            These values are drawn directly from the content files, so the log stays accurate as
            ATLAS is updated.
          </p>
        </section>
      </div>
    </>
  );
}

function LogRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-sm font-medium text-um-black-metallic">{label}</dt>
      <dd className="text-sm font-semibold text-um-blue">{value}</dd>
    </div>
  );
}
