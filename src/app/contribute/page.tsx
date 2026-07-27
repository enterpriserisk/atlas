import type { Metadata } from "next";
import { PageHeader, Card, CardBody } from "@/components/ui";
import { AccessKeyForm } from "@/components/contribute/AccessKeyForm";
import { getContributorSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Add a Playbook entry or a Resource Directory resource — enter your access key to unlock the submission forms.",
};

export const dynamic = "force-dynamic";

/**
 * Contribute — the entry point for ATLAS's dynamic "living resource" model. Since staff
 * and interns won't have file/git access once this is hosted online, contributions happen
 * here: enter an access key (issued via /admin) to unlock two forms that publish directly
 * to the live site — no file editing, no pull request.
 */
export default async function ContributePage() {
  const session = await getContributorSession();

  return (
    <>
      <PageHeader
        eyebrow="Living resource"
        title="Contribute to ATLAS"
        description={
          session
            ? `Welcome back, ${session.label}. Choose what you'd like to add — it publishes immediately.`
            : "ATLAS grows through staff and intern contributions. Enter the access key you were given to unlock the forms below. Don't have one? Ask whoever manages ATLAS for your team."
        }
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {!session ? (
          <AccessKeyForm />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card href="/contribute/playbook">
              <CardBody>
                <h2 className="text-lg font-semibold text-um-blue">Add a Playbook entry</h2>
                <p className="mt-1 text-sm text-um-black-metallic">
                  Share AI-use guidance, a use-case example, or a standard for others to follow.
                </p>
              </CardBody>
            </Card>
            <Card href="/contribute/directory">
              <CardBody>
                <h2 className="text-lg font-semibold text-um-blue">Add a Directory resource</h2>
                <p className="mt-1 text-sm text-um-black-metallic">
                  Share a tool or resource you&apos;ve found useful with the rest of ERM.
                </p>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
