import type { Metadata } from "next";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CardDescription,
  Badge,
  HumanReviewBadge,
  NonUniversityToolBadge,
  AiAssistedNotice,
  Accordion,
  ProgressBar,
  Stepper,
  PageHeader,
  DraftTag,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Style Guide",
  description: "ATLAS design-system component reference.",
};

/**
 * Internal component gallery — a living reference for the ATLAS design system.
 * Useful for QA and for future contributors to see available primitives.
 */
export default function StyleGuidePage() {
  return (
    <>
      <PageHeader
        eyebrow="Internal reference"
        title="ATLAS Style Guide"
        description="The shared design-system components used across ATLAS. All colors use pre-approved, WCAG-safe brand pairings."
      />
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6">
        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="maize">Maize accent</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="blue">Blue</Badge>
            <Badge tone="maize">Maize</Badge>
            <Badge tone="success">Success</Badge>
            <Badge tone="warning">Warning</Badge>
            <Badge tone="danger">Danger</Badge>
            <Badge tone="info">Info</Badge>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <HumanReviewBadge status="Yes" reason="external-facing output" />
            <HumanReviewBadge status="Conditional" reason="if it touches personal data" />
            <HumanReviewBadge status="No" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <NonUniversityToolBadge />
            <AiAssistedNotice />
            <DraftTag />
          </div>
        </Section>

        <Section title="Callout banners">
          <div className="space-y-3">
            <NonUniversityToolBadge variant="banner" />
            <AiAssistedNotice variant="banner" />
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardBody>
                <CardTitle>Standard card</CardTitle>
                <CardDescription>A plain surface for grouping content.</CardDescription>
              </CardBody>
            </Card>
            <Card accent="bg-um-maize">
              <CardBody>
                <CardTitle>Accented card</CardTitle>
                <CardDescription>Left accent bar in a brand color.</CardDescription>
              </CardBody>
            </Card>
            <Card href="/style-guide">
              <CardBody>
                <CardTitle>Linked card</CardTitle>
                <CardDescription>The whole card is a focusable link.</CardDescription>
              </CardBody>
            </Card>
          </div>
        </Section>

        <Section title="Stepper">
          <Stepper
            current={2}
            steps={[
              { id: "intake", label: "Task" },
              { id: "assess", label: "Assessment" },
              { id: "tools", label: "Tools" },
              { id: "continue", label: "Continue" },
              { id: "refine", label: "Refine" },
              { id: "prompt", label: "Prompt" },
            ]}
          />
        </Section>

        <Section title="Progress bar">
          <ProgressBar value={3} max={5} label="Refinement questions" />
        </Section>

        <Section title="Accordion">
          <Accordion
            defaultOpen={["a"]}
            items={[
              {
                id: "a",
                title: "First section",
                meta: <Badge tone="success">Ready</Badge>,
                content: <p>Panel content for the first section.</p>,
              },
              {
                id: "b",
                title: "Second section",
                content: <p>Panel content for the second section.</p>,
              },
            ]}
          />
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-um-blue">{title}</h2>
      {children}
    </section>
  );
}
