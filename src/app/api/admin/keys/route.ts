import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/session";
import { createContributorKey } from "@/lib/auth/keys";

/** POST /api/admin/keys — generates a new contributor access key. Admin session required.
 * The raw key is returned exactly once in this response and never stored/shown again. */
export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { label?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const label = body.label?.trim();
  if (!label) {
    return NextResponse.json({ error: "A contributor name/label is required." }, { status: 400 });
  }

  try {
    const { id, rawKey } = await createContributorKey(label);
    return NextResponse.json({ id, rawKey });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create the key." },
      { status: 500 },
    );
  }
}
