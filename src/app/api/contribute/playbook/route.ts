import { NextResponse } from "next/server";
import { getContributorSession } from "@/lib/auth/session";
import { isContributorKeyActive } from "@/lib/auth/keys";
import { createPlaybookSubmission } from "@/lib/content/submissions";
import { getPlaybookEntries } from "@/lib/content/loaders";
import { PLAYBOOK_CATEGORIES } from "@/lib/content/types";
import type { ReviewRequirement } from "@/lib/content/types";

interface Body {
  title?: string;
  category?: string;
  tags?: string[];
  aiToolsReferenced?: string[];
  humanReviewRequired?: string;
  summary?: string;
  body?: string;
}

const VALID_REVIEW: ReviewRequirement[] = ["Yes", "No", "Conditional"];

/** POST /api/contribute/playbook — inserts a new playbook entry. Contributor session
 * required (set by /api/contribute/unlock). Publishes immediately, no review queue. */
export async function POST(req: Request) {
  const session = await getContributorSession();
  if (!session) {
    return NextResponse.json(
      { error: "Enter your access key on the Contribute page first." },
      { status: 401 },
    );
  }
  if (!(await isContributorKeyActive(session.contributorId))) {
    return NextResponse.json(
      { error: "Your access key has been revoked. Contact the site admin for a new one." },
      { status: 403 },
    );
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = body.title?.trim();
  const category = body.category?.trim();
  const summary = body.summary?.trim();
  const bodyText = body.body?.trim();
  const humanReviewRequired = body.humanReviewRequired?.trim();

  if (!title || !category || !summary || !bodyText || !humanReviewRequired) {
    return NextResponse.json(
      { error: "Title, category, summary, body, and human-review status are all required." },
      { status: 400 },
    );
  }
  if (!(PLAYBOOK_CATEGORIES as readonly string[]).includes(category)) {
    return NextResponse.json({ error: "Not a valid category." }, { status: 400 });
  }
  if (!VALID_REVIEW.includes(humanReviewRequired as ReviewRequirement)) {
    return NextResponse.json({ error: "Not a valid human-review status." }, { status: 400 });
  }

  const tags = Array.isArray(body.tags) ? body.tags.filter((t) => typeof t === "string" && t.trim()) : [];
  const aiToolsReferenced = Array.isArray(body.aiToolsReferenced)
    ? body.aiToolsReferenced.filter((t) => typeof t === "string" && t.trim())
    : [];

  try {
    const staticSlugs = getPlaybookEntries().map((e) => e.slug);
    const entry = await createPlaybookSubmission(
      {
        title,
        category,
        tags,
        aiToolsReferenced,
        humanReviewRequired: humanReviewRequired as ReviewRequirement,
        summary,
        body: bodyText,
        contributorLabel: session.label,
      },
      staticSlugs,
      session.contributorId,
    );
    return NextResponse.json({ ok: true, slug: entry.slug });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save the entry." },
      { status: 500 },
    );
  }
}
