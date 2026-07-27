import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/session";
import { revokeContributorKey } from "@/lib/auth/keys";

/** POST /api/admin/keys/:id/revoke — revokes one contributor key. Admin session required. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const keyId = Number(id);
  if (!Number.isInteger(keyId)) {
    return NextResponse.json({ error: "Invalid key id." }, { status: 400 });
  }

  try {
    await revokeContributorKey(keyId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not revoke the key." },
      { status: 500 },
    );
  }
}
