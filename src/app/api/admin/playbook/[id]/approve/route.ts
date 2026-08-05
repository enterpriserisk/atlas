import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/session";
import { approvePlaybookSubmission } from "@/lib/content/submissions";

/** POST /api/admin/playbook/:id/approve — marks a submission as reviewed, clearing its
 * Draft badge. Admin session required. Submissions are already publicly visible before
 * this — approval only tracks that ESRM has reviewed the entry. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const entryId = Number(id);
  if (!Number.isInteger(entryId)) {
    return NextResponse.json({ error: "Invalid entry id." }, { status: 400 });
  }

  try {
    const approved = await approvePlaybookSubmission(entryId);
    if (!approved) return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not approve the entry." },
      { status: 500 },
    );
  }
}
