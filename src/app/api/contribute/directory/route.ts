import { NextResponse } from "next/server";
import { getContributorSession } from "@/lib/auth/session";
import { createDirectoryResource } from "@/lib/content/directory";

interface Body {
  name?: string;
  url?: string;
  description?: string;
  tags?: string[];
}

/** POST /api/contribute/directory — inserts a new Resource Directory entry. Contributor
 * session required. Publishes immediately, no review queue. */
export async function POST(req: Request) {
  const session = await getContributorSession();
  if (!session) {
    return NextResponse.json(
      { error: "Enter your access key on the Contribute page first." },
      { status: 401 },
    );
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const description = body.description?.trim();
  const url = body.url?.trim();

  if (!name || !description) {
    return NextResponse.json({ error: "Name and description are required." }, { status: 400 });
  }
  if (url) {
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "That URL doesn't look valid." }, { status: 400 });
    }
  }

  const tags = Array.isArray(body.tags) ? body.tags.filter((t) => typeof t === "string" && t.trim()) : [];

  try {
    const resource = await createDirectoryResource({
      name,
      url: url || null,
      description,
      tags,
      contributorLabel: session.label,
    });
    return NextResponse.json({ ok: true, id: resource.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save the resource." },
      { status: 500 },
    );
  }
}
