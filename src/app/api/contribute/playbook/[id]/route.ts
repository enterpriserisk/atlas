import { NextResponse } from "next/server";
import { isAdminAuthenticated, getContributorSession } from "@/lib/auth/session";
import { isContributorKeyActive } from "@/lib/auth/keys";
import { deletePlaybookSubmission } from "@/lib/content/submissions";

/** DELETE /api/contribute/playbook/:id — removes a playbook submission. An admin session
 * may delete any submission; a contributor session may only delete their own, and only
 * while their key is still active. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entryId = Number(id);
  if (!Number.isInteger(entryId)) {
    return NextResponse.json({ error: "Invalid entry id." }, { status: 400 });
  }

  const isAdmin = await isAdminAuthenticated();
  if (isAdmin) {
    try {
      const deleted = await deletePlaybookSubmission(entryId, null);
      if (!deleted) return NextResponse.json({ error: "Entry not found." }, { status: 404 });
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Could not delete the entry." },
        { status: 500 },
      );
    }
  }

  const session = await getContributorSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (!(await isContributorKeyActive(session.contributorId))) {
    return NextResponse.json(
      { error: "Your access key has been revoked. Contact the site admin for a new one." },
      { status: 403 },
    );
  }

  try {
    const deleted = await deletePlaybookSubmission(entryId, session.contributorId);
    if (!deleted) {
      return NextResponse.json(
        { error: "Entry not found, or it doesn't belong to your access key." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not delete the entry." },
      { status: 500 },
    );
  }
}
