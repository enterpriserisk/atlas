import { NextResponse } from "next/server";
import { signSession, safeCompare, adminCookieOptions, ADMIN_COOKIE } from "@/lib/auth/session";

/** POST /api/admin/login — checks the submitted secret against ADMIN_SECRET and, if it
 * matches, sets a signed admin session cookie. This is the only gate on /admin. */
export async function POST(req: Request) {
  let body: { secret?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json(
      { error: "ADMIN_SECRET is not configured on the server." },
      { status: 500 },
    );
  }

  if (!body.secret || !safeCompare(body.secret, adminSecret)) {
    return NextResponse.json({ error: "Incorrect admin secret." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, signSession({ admin: true }), adminCookieOptions());
  return res;
}
