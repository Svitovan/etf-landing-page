import { NextRequest, NextResponse } from "next/server";
import {
  createAnalyticsSession,
  deactivateAnalyticsSession,
} from "../../../lib/server/analytics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const consentVersion = String(body.consentVersion || "2026-10-11");
    const utmContent =
      typeof body.utmContent === "string" && ["ad_a", "ad_b"].includes(body.utmContent)
        ? body.utmContent
        : null;

    const { sessionId, expiresAt } = await createAnalyticsSession(
      consentVersion,
      utmContent
    );

    const res = NextResponse.json({ success: true, sessionId });

    // Set secure, HttpOnly session cookie
    res.cookies.set("etf_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const sessionId = req.cookies.get("etf_session")?.value;
  if (sessionId) {
    await deactivateAnalyticsSession(sessionId);
  }

  const res = NextResponse.json({ success: true });
  res.cookies.delete("etf_session");
  return res;
}
