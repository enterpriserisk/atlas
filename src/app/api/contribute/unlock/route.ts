import { NextResponse } from "next/server";
import { signSession, contributorCookieOptions, CONTRIBUTOR_COOKIE } from "@/lib/auth/session";
import { verifyContributorKey } from "@/lib/auth/keys";

/** POST /api/contribute/unlock — verifies an access key and, if valid and not revoked,
 * sets a signed contributor session cookie that unlocks the submission forms. */
export async function POST(req: Request) {
  let body: { key?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawKey = body.key?.trim();
  if (!rawKey) {
    return NextResponse.json({ error: "An access key is required." }, { status: 400 });
  }

  let session;
  try {
    session = await verifyContributorKey(rawKey);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not verify the key." },
      { status: 500 },
    );
  }

  if (!session) {
    return NextResponse.json(
      { error: "That access key isn't valid or has been revoked." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true, label: session.label });
  res.cookies.set(CONTRIBUTOR_COOKIE, signSession(session), contributorCookieOptions());
  return res;
}
