import type { Metadata } from "next";
import { PageHeader, Card, CardBody, Badge, Button } from "@/components/ui";
import { getDirectoryResources } from "@/lib/content/directory";

export const metadata: Metadata = {
  title: "Resource Directory",
  description:
    "Tools and resources ERM staff and interns have found useful and shared with each other — not officially vetted, just shared internally.",
};

export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  const resources = await getDirectoryResources();

  return (
    <>
      <PageHeader
        eyebrow="Resource Directory"
        title="Shared by ERM staff"
        description="Tools and resources staff and interns have found useful and shared with each other. Unlike the Tool Directory, these aren't officially vetted — treat them as peer recommendations, not endorsements."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-sm text-um-stone" aria-live="polite">
            {resources.length} {resources.length === 1 ? "resource" : "resources"}
          </p>
          <Button href="/contribute/directory" variant="secondary" size="sm">
            + Add a resource
          </Button>
        </div>

        {resources.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-subtle bg-surface-muted p-8 text-center text-um-stone">
            Nothing here yet. Have a look at the{" "}
            <a href="/contribute/directory" className="font-medium text-um-arboretum-blue underline underline-offset-2 hover:text-um-blue">
              Contribute
            </a>{" "}
            page to add the first one.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {resources.map((r) => (
              <li key={r.id}>
                <Card className="h-full">
                  <CardBody className="flex h-full flex-col">
                    <h2 className="text-lg font-semibold text-um-blue">
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {r.name}
                        </a>
                      ) : (
                        r.name
                      )}
                    </h2>
                    <p className="mt-1 flex-1 text-sm leading-relaxed text-um-black-metallic">{r.description}</p>
                    {r.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {r.tags.map((tag) => (
                          <Badge key={tag} tone="neutral" glyph={null}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="mt-3 text-xs text-um-stone">
                      Added by {r.contributorLabel} on {r.submittedAt}
                    </p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
